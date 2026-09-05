import * as THREE from 'three';

import Module from '../Module';
import Particle from '../Particle';
import ParticleSystem from '../ParticleSystem';
import Collision from './Collision';
import { DynamicValue } from '../types/DynamicValue';
import evaluateDynamicNumber from '../helpers/evaluateDynamicNumber';
import { CollisionHit } from '../interfaces/ICollisionBackend';
import particleRatio from '../helpers/particleRatio';

export interface AudioOptions {
  listener?: THREE.AudioListener;

  sound?: AudioBuffer | [AudioBuffer, ...AudioBuffer[]];
  onCollisionSound?: AudioBuffer | [AudioBuffer, ...AudioBuffer[]];

  ratio: number;
  collisionRatio: number;

  pitch: DynamicValue<number>;
  volume: DynamicValue<number>;

  sizeAffectsPitch: number;
  sizeAffectsVolume: number;

  alphaAffectsPitch: number;
  alphaAffectsVolume: number;

  speedAffectsPitch: number;
  speedAffectsVolume: number;
}

interface ParticleAudio {
  audio: THREE.PositionalAudio;
  buffer: AudioBuffer;
}

class Audio extends Module {
  listener?: THREE.AudioListener;

  sound?: [AudioBuffer, ...AudioBuffer[]];

  onCollisionSound?: [AudioBuffer, ...AudioBuffer[]];

  ratio: number;

  collisionRatio: number;

  pitch: DynamicValue<number>;

  volume: DynamicValue<number>;

  sizeAffectsPitch: number;

  sizeAffectsVolume: number;

  alphaAffectsPitch: number;

  alphaAffectsVolume: number;

  speedAffectsPitch: number;

  speedAffectsVolume: number;

  private _system?: ParticleSystem;

  private _particleAudio = new Map<string, ParticleAudio>();

  private _collisionAudio = new Set<THREE.PositionalAudio>();

  private _collision?: Collision;

  private _setUpCollision: boolean = false;

  constructor(options: Partial<AudioOptions> = {}) {
    super((particle) => this._updateParticle(particle));

    this.listener = options.listener;

    this.sound = options.sound
      ? (Array.isArray(options.sound) ? options.sound : [options.sound])
      : undefined;

    this.onCollisionSound = options.onCollisionSound
      ? (Array.isArray(options.onCollisionSound) ? options.onCollisionSound : [options.onCollisionSound])
      : undefined;

    this.ratio = THREE.MathUtils.clamp(options.ratio ?? 1, 0, 1);
    this.collisionRatio = THREE.MathUtils.clamp(options.collisionRatio ?? this.ratio, 0, 1);

    this.pitch = options.pitch ?? 1;
    this.volume = options.volume ?? 1;

    this.sizeAffectsPitch = Math.max(0, options.sizeAffectsPitch ?? 0);
    this.sizeAffectsVolume = Math.max(0, options.sizeAffectsVolume ?? 0);

    this.alphaAffectsPitch = Math.max(0, options.alphaAffectsPitch ?? 0);
    this.alphaAffectsVolume = Math.max(0, options.alphaAffectsVolume ?? 0);

    this.speedAffectsPitch = Math.max(0, options.speedAffectsPitch ?? 0);
    this.speedAffectsVolume = Math.max(0, options.speedAffectsVolume ?? 0);
  }

  public prepare(system: ParticleSystem): void {
    this._system = system;

    if (!this.listener) {
      // Try to get listener from cache
      if (system.scene) this.listener = system.scene.userData["__rmps_audioListener"];

      // Try to get listener from camera
      if (system.sceneCamera) {
        system.sceneCamera.traverse((object) => {
          if (!this.listener && object instanceof THREE.AudioListener) {
            this.listener = object;
          }
        });

        // Add to camera if its not there
        if (!this.listener) {
          this.listener = new THREE.AudioListener();
          system.sceneCamera.add(this.listener);
        }
      }

      // If we found a listener, add it to the scene cache
      if (this.listener && system.scene) system.scene.userData["__rmps_audioListener"] = this.listener;
    }

    if (this.onCollisionSound && !this._setUpCollision) {
      this._collision = system.modules
        .flatMap((module) => module.withDependents())
        .find((module) => module instanceof Collision);

      if (this._collision) {
        this._collision.onCollision(
          (particle, hit) => this._handleCollision(particle, hit),
        );

        this._setUpCollision = true;
      }
    }

    this._cleanParticleAudio(system.particles);
  }

  private _updateParticle(particle: Particle): void {
    if (!this.listener || !this.sound || !this._system) return;

    if (!particleRatio(particle, this.ratio)) {
      this._removeParticleAudio(particle.id);
      return;
    }

    let state = this._particleAudio.get(particle.id);

    if (!state) {
      const audio = new THREE.PositionalAudio(this.listener);
      const sound = this.sound[Math.floor(Math.random() * this.sound.length)];

      audio.setBuffer(sound);
      audio.setLoop(true);

      this._system.add(audio);

      state = {
        audio,
        buffer: sound,
      };

      this._particleAudio.set(particle.id, state);

      audio.play();
    }

    state.audio.position.copy(particle.position);
    state.audio.setPlaybackRate(this._getPitch(particle));
    state.audio.setVolume(this._getVolume(particle));
  }

  private _handleCollision(
    particle: Particle,
    _hit: CollisionHit,
  ): void {
    if (
      !this.listener
      || !this.onCollisionSound
      || !this._system
      || !particleRatio(particle, this.collisionRatio)
    ) {
      return;
    }

    const audio = new THREE.PositionalAudio(this.listener);

    audio.setBuffer(this.onCollisionSound[Math.floor(Math.random() * this.onCollisionSound.length)]);
    audio.setLoop(false);

    audio.position.copy(particle.position);
    audio.setPlaybackRate(this._getPitch(particle));
    audio.setVolume(this._getVolume(particle));

    this._system.add(audio);
    this._collisionAudio.add(audio);

    audio.play();

    /*
     * THREE.Audio creates a new AudioBufferSourceNode when play() is
     * called. Clean the temporary source up once that playback ends.
     */
    if (audio.source) {
      audio.source.addEventListener('ended', () => {
        this._collisionAudio.delete(audio);
        audio.removeFromParent();
      });
    }
  }

  private _getPitch(particle: Particle): number {
    const base = evaluateDynamicNumber(
      this.pitch,
      particle.time,
      particle.id,
    );

    return Math.max(
      0,
      base
        * this._getEffect(particle.scale.length(), this.sizeAffectsPitch)
        * this._getEffect(particle.alpha, this.alphaAffectsPitch)
        * this._getEffect(particle.velocity.length() * particle.speed, this.speedAffectsPitch),
    );
  }

  private _getVolume(particle: Particle): number {
    const base = evaluateDynamicNumber(
      this.volume,
      particle.time,
      particle.id,
    );

    return Math.max(
      0,
      base
        * this._getEffect(particle.scale.length(), this.sizeAffectsVolume)
        * this._getEffect(particle.alpha, this.alphaAffectsVolume)
        * this._getEffect(particle.velocity.length(), this.speedAffectsVolume),
    );
  }

  // eslint-disable-next-line class-methods-use-this
  private _getEffect(value: number, effect: number): number {
    return Math.pow(Math.max(0, value), effect);
  }

  private _cleanParticleAudio(particles: Particle[]): void {
    const activeParticles = new Set(
      particles
        .filter((particle) => particleRatio(particle, this.ratio))
        .map((particle) => particle.id),
    );

    this._particleAudio.forEach((_state, id) => {
      if (!activeParticles.has(id)) {
        this._removeParticleAudio(id);
      }
    });
  }

  private _removeParticleAudio(id: string): void {
    const state = this._particleAudio.get(id);
    if (!state) return;

    if (state.audio.isPlaying) {
      state.audio.stop();
    }

    state.audio.removeFromParent();
    this._particleAudio.delete(id);
  }

  public cleanup(): void {
    this._particleAudio.forEach((_state, id) => {
      this._removeParticleAudio(id);
    });

    this._collisionAudio.forEach((audio) => {
      if (audio.isPlaying) {
        audio.stop();
      }

      audio.removeFromParent();
    });

    this._collisionAudio.clear();
  }
}

export default Audio;
