import * as THREE from 'three';
import EmissionShape from './EmissionShape';
import Particle from './Particle';
import { InitialParticleValues } from './interfaces/InitialParticleValues';
import evaluateDynamicVector from './helpers/evaluateDynamicVector3';
import evaluateDynamicNumber from './helpers/evaluateDynamicNumber';
import evaluateDynamicColor from './helpers/evaluateDynamicColor';
import { dynamicValue } from './types/dynamicValue';
import { multiple } from './types/multiple';
import acceptMultiple from './helpers/acceptMultiple';

type SpawnBurst = {
    time: number,
    count: number,
    fired?: boolean,
};

interface EmitterOptions {
    initialValues: Partial<InitialParticleValues>;
    source: EmissionShape;
    bursts: multiple<SpawnBurst>;
    rate: dynamicValue<number>;
    duration: number;
    looping: boolean;
}

class Emitter {
    source: EmissionShape;

    rate: dynamicValue<number>;

    duration: number;

    looping: boolean;

    bursts: SpawnBurst[];

    initialValues: Partial<InitialParticleValues>;

    private _lastSpawn: number;

    private _startTime: number;

    constructor(
      options: Partial<EmitterOptions> = {},
    ) {
      this.source = options.source ?? EmissionShape.Sphere();
      this.initialValues = options.initialValues ?? { radial: 1 };
      this.rate = options.rate ?? 50;
      this.bursts = acceptMultiple(options.bursts ?? []);
      this.duration = options.duration ?? 10;
      this.looping = options.looping ?? true;

      this._lastSpawn = Date.now();
      this._startTime = Date.now();

      document.addEventListener('visibilitychange', () => {
        const now = Date.now();
        if (now - this._lastSpawn > this.rate) {
          const time = ((now - this._startTime) / (this.duration * 1000));
          this._lastSpawn = Date.now() - evaluateDynamicNumber(this.initialValues.lifetime, time) * 1000;
        }
      });
    }

    update(particles: Particle[]) {
      const now = Date.now();
      const time = ((now - this._startTime) / (this.duration * 1000));

      // Spawning
      if (now - this._startTime < this.duration * 1000) {
        // Rate
        const timeSinceLast = now - this._lastSpawn;
        const secondsPerParticle = (1000 / evaluateDynamicNumber(this.rate, time));
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
      const now = Date.now();
      const time = ((now - this._startTime) / (this.duration * 1000));
      const { position, normal } = this.source.getPoint();

      const particle = new Particle({
        position,
        rotation: evaluateDynamicVector(this.initialValues.rotation ?? new THREE.Vector3(0, 0, 0), time),
        scale: evaluateDynamicVector(this.initialValues.scale ?? new THREE.Vector3(1, 1, 1), time),
        color: evaluateDynamicColor(this.initialValues.color ?? new THREE.Color(1, 1, 1), time),
        alpha: evaluateDynamicNumber(this.initialValues.alpha ?? 1, time),
        lifetime: evaluateDynamicNumber(this.initialValues.lifetime ?? 1, time),
      });

      particle.velocity = evaluateDynamicVector(this.initialValues.velocity ?? new THREE.Vector3(0, 0, 0), time)
        .add(normal.multiplyScalar(
          evaluateDynamicNumber(this.initialValues.radial ?? 0, time),
        ));

      if (this.initialValues.angularVelocity) particle.angularVelocity = evaluateDynamicVector(this.initialValues.angularVelocity, time);
      if (this.initialValues.scalarVelocity) particle.scalarVelocity = evaluateDynamicVector(this.initialValues.scalarVelocity, time);

      if (this.initialValues.acceleration) particle.acceleration = evaluateDynamicVector(this.initialValues.acceleration, time);
      if (this.initialValues.angularAcceleration) particle.angularAcceleration = evaluateDynamicVector(this.initialValues.angularAcceleration, time);
      if (this.initialValues.scalarAcceleration) particle.scalarAcceleration = evaluateDynamicVector(this.initialValues.scalarAcceleration, time);

      particles.push(particle);
    }
}

export default Emitter;
