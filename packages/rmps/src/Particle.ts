import { nanoid } from 'nanoid';
import * as THREE from 'three';

interface ParticleOptions {
    position: THREE.Vector3;
    rotation: THREE.Vector3;
    scale: THREE.Vector3;
    color: THREE.Color;
    alpha: number;
    lifetime: number;
}

export interface ParticleStartValues {
    position: THREE.Vector3;
    rotation: THREE.Vector3;
    scale: THREE.Vector3;
    velocity: THREE.Vector3;
    angularVelocity: THREE.Vector3;
    scalarVelocity: THREE.Vector3;
    acceleration: THREE.Vector3;
    angularAcceleration: THREE.Vector3;
    scalarAcceleration: THREE.Vector3;
    speed: number;
    color: THREE.Color;
    alpha: number;
}

export interface ParticleNoiseValues {
    noise: number;
    noise4d: number;
}

class Particle {
    position: THREE.Vector3;

    rotation: THREE.Vector3;

    scale: THREE.Vector3;

    velocity: THREE.Vector3 = new THREE.Vector3(0, 0, 0);

    angularVelocity: THREE.Vector3 = new THREE.Vector3(0, 0, 0);

    scalarVelocity: THREE.Vector3 = new THREE.Vector3(0, 0, 0);

    acceleration: THREE.Vector3 = new THREE.Vector3(0, 0, 0);

    angularAcceleration: THREE.Vector3 = new THREE.Vector3(0, 0, 0);

    scalarAcceleration: THREE.Vector3 = new THREE.Vector3(0, 0, 0);

    speed = 1;

    color: THREE.Color;

    alpha: number;

    startTime: number;

    lifetime: number;

    time: number;

    realtime: number;

    id: string;

    start: ParticleStartValues;

    noise: Record<string, ParticleNoiseValues>;

    // Used to store custom data for special components
    data: any;

    constructor(options: Partial<ParticleOptions> = {}) {
      this.position = options.position ?? new THREE.Vector3();
      this.rotation = options.rotation ?? new THREE.Vector3();
      this.scale = options.scale ?? new THREE.Vector3(1, 1, 1);
      this.color = options.color ?? new THREE.Color(0xffffff);
      this.alpha = options.alpha ?? 1;

      this.lifetime = options.lifetime ?? 5;
      this.startTime = Date.now();
      this.time = 0;
      this.realtime = 0;

      this.id = nanoid();

      this.start = this.createStartValues();
      this.noise = {};
      this.data = {};
    }

    cacheStartValues() {
      this.start = this.createStartValues();
    }

    private createStartValues(): ParticleStartValues {
      return {
        position: this.position.clone(),
        rotation: this.rotation.clone(),
        scale: this.scale.clone(),
        velocity: this.velocity.clone(),
        angularVelocity: this.angularVelocity.clone(),
        scalarVelocity: this.scalarVelocity.clone(),
        acceleration: this.acceleration.clone(),
        angularAcceleration: this.angularAcceleration.clone(),
        scalarAcceleration: this.scalarAcceleration.clone(),
        speed: this.speed,
        color: this.color.clone(),
        alpha: this.alpha,
      };
    }

    update(deltaTime: number) {
      // Update time
      this.realtime = (Date.now() - this.startTime) / 1000;
      this.time = this.realtime / this.lifetime;

      // Update velocities
      this.velocity.addScaledVector(this.acceleration, deltaTime * this.speed);
      this.angularVelocity.addScaledVector(this.angularAcceleration, deltaTime * this.speed);
      this.scalarVelocity.addScaledVector(this.scalarAcceleration, deltaTime * this.speed);

      // Update transform
      this.position.addScaledVector(this.velocity, deltaTime * this.speed);
      this.rotation.addScaledVector(this.angularVelocity, deltaTime * this.speed);
      this.scale.addScaledVector(this.scalarVelocity, deltaTime * this.speed);
    }
}

export default Particle;
