import * as THREE from 'three';
import EmissionShape from './EmissionShape';
import Particle from './Particle';
import InitialParticleValues from './interfaces/InitialParticleValues';

type SpawnBurst = {time: number, count: number};

class Emitter {
    source: EmissionShape;

    rate: number;

    duration: number;

    looping: boolean;

    bursts: SpawnBurst[];

    initialValues: Partial<InitialParticleValues>;

    private _lastSpawn: number;

    private _nextBurstIndex: number;

    private _startTime: number;

    constructor(
      initialValues: Partial<InitialParticleValues> = {},
      source: EmissionShape = EmissionShape.Sphere,
      bursts: SpawnBurst[] = [],
      rate = 10,
      duration = 5,
      looping = false,
    ) {
      this.source = source;
      this.initialValues = initialValues;
      this.rate = rate;
      this.bursts = bursts;
      this.duration = duration;
      this.looping = looping;

      this._lastSpawn = Date.now();
      this._nextBurstIndex = 0;
      this._startTime = Date.now();
    }

    get nextBurst(): SpawnBurst {
      return this.bursts[this._nextBurstIndex];
    }

    update(particles: Particle[]) {
      const now = Date.now();

      // Rate
      if (now - this._lastSpawn > 1000 / this.rate) {
        this._lastSpawn = now;
        this.spawnParticle(particles);
      }

      // Bursts
      if (this.bursts.length > 0 && now - this._startTime > this.nextBurst.time) {
        for (let i = 0; i < this.nextBurst.count; i += 1) {
          this.spawnParticle(particles);
        }
        this._nextBurstIndex = (this._nextBurstIndex + 1) % this.bursts.length;
      }

      // Looping
      if (now - this._startTime > this.duration && this.looping) {
        this._startTime = now;
      }
    }

    private spawnParticle(particles: Particle[]) {
      const { position, normal } = this.source.getPoint();
      const zeroVector = new THREE.Vector3(0, 0, 0);

      const particle = new Particle(
        position,
        this.initialValues.rotation,
        this.initialValues.scale,
        this.initialValues.color,
        this.initialValues.alpha,
        this.initialValues.lifetime,
      );

      particle.velocity = this.initialValues.velocity
          ?? (this.initialValues.radial ? normal : zeroVector);
      particle.angularVelocity = this.initialValues.angularVelocity ?? zeroVector;
      particle.scalarVelocity = this.initialValues.scalarVelocity ?? zeroVector;

      particle.acceleration = this.initialValues.acceleration ?? zeroVector;
      particle.angularAcceleration = this.initialValues.angularAcceleration ?? zeroVector;
      particle.scalarAcceleration = this.initialValues.scalarAcceleration ?? zeroVector;

      particles.push(particle);
    }
}

export default Emitter;
