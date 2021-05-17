import * as THREE from 'three';
import EmissionShape from './EmissionShape';
import Particle from './Particle';
import InitialParticleValues from './interfaces/InitialParticleValues';

type SpawnBurst = {
    time: number,
    count: number,
    fired?: boolean,
};

class Emitter {
    source: EmissionShape;

    rate: number;

    duration: number;

    looping: boolean;

    bursts: SpawnBurst[];

    initialValues: Partial<InitialParticleValues>;

    private _lastSpawn: number;

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
      this._startTime = Date.now();
    }

    update(particles: Particle[]) {
      const now = Date.now();

      // Spawning
      if (now - this._startTime < this.duration * 1000) {
        // Rate
        const timeSinceLast = now - this._lastSpawn;
        const secondsPerParticle = (1000 / this.rate);
        const particlesDue = Math.floor(timeSinceLast / secondsPerParticle);
        for (let i = 0; i < particlesDue; i += 1) {
          this.spawnParticle(particles);
          this._lastSpawn = now;
        }

        // Bursts
        this.bursts.forEach((burst) => {
          if (!burst.fired && burst.time * this.duration * 1000 < now - this._startTime) {
            for (let j = 0; j < burst.count; j += 1) {
              this.spawnParticle(particles);
            }

            burst.fired = true;
          }
        });
      } else if (this.looping) {
        // Reset time
        this._startTime = now;

        // Reset bursts
        this.bursts.forEach((burst) => { burst.fired = false; });
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
