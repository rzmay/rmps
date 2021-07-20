import * as THREE from 'three';
import EmissionShape from './EmissionShape';
import Particle from './Particle';
import { InitialParticleValues } from './interfaces/InitialParticleValues';
import evaluateDynamicVector from './helpers/evaluateDynamicVector3';
import evaluateDynamicNumber from './helpers/evaluateDynamicNumber';
import evaluateDynamicColor from './helpers/evaluateDynamicColor';

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
      rate = 50,
      duration = 10,
      looping = true,
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
      const now = Date.now();
      const time = ((now - this._startTime) / (this.duration * 1000));
      const { position, normal } = this.source.getPoint();

      const particle = new Particle(
        position,
        evaluateDynamicVector(this.initialValues.rotation ?? new THREE.Vector3(0, 0, 0), time),
        evaluateDynamicVector(this.initialValues.scale ?? new THREE.Vector3(1, 1, 1), time),
        evaluateDynamicColor(this.initialValues.color ?? new THREE.Color(1, 1, 1), time),
        evaluateDynamicNumber(this.initialValues.alpha ?? 1, time),
        evaluateDynamicNumber(this.initialValues.lifetime ?? 1, time),
      );

      particle.velocity = evaluateDynamicVector(this.initialValues.velocity ?? new THREE.Vector3(0, 0, 0), time)
        .add(normal.multiplyScalar(
          evaluateDynamicNumber(this.initialValues.radial ?? 0, time),
        ));
      //
      // if (this.initialValues.angularVelocity) particle.angularVelocity = evaluateDynamicVector(this.initialValues.angularVelocity, time);
      // if (this.initialValues.scalarVelocity) particle.scalarVelocity = evaluateDynamicVector(this.initialValues.scalarVelocity, time);
      //
      // if (this.initialValues.acceleration) particle.acceleration = evaluateDynamicVector(this.initialValues.acceleration, time);
      // if (this.initialValues.angularAcceleration) particle.angularAcceleration = evaluateDynamicVector(this.initialValues.angularAcceleration, time);
      // if (this.initialValues.scalarAcceleration) particle.scalarAcceleration = evaluateDynamicVector(this.initialValues.scalarAcceleration, time);

      particles.push(particle);
    }
}

export default Emitter;
