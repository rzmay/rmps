import * as THREE from 'three';
import Module from '../Module';
import Particle from '../Particle';
import { DynamicValue } from '../types/DynamicValue';
import evaluateDynamicNumber from '../helpers/evaluateDynamicNumber';
import evaluateDynamicVector from '../helpers/evaluateDynamicVector3';
import NoiseModule from './NoiseModule';

export interface NoiseOptions {
    strength: DynamicValue<THREE.Vector3>;
    frequency: number;
    scrollSpeed?: DynamicValue<number>;
    octaves?: number;
    octaveMultiplier?: number;
    octaveScale?: number;
    damping?: boolean;
}

class TransformByNoise extends Module {
    private noiseX: NoiseModule;

    private noiseY: NoiseModule;

    private noiseZ: NoiseModule;

    constructor(public options: NoiseOptions) {
      const noiseOptions = {
        octaves: options.octaves ?? 1,
        frequency: options.frequency,
        lacunarity: options.octaveScale ?? 2,
        persistence: options.octaveMultiplier ?? 0.5,
      };
      const key = `transformByNoise-${Math.random().toString(36).slice(2)}`;
      const noiseX = new NoiseModule(`${key}-x`, { ...noiseOptions, offset: new THREE.Vector3(0, 0, 0) });
      const noiseY = new NoiseModule(`${key}-y`, { ...noiseOptions, offset: new THREE.Vector3(31.416, 0, 0) });
      const noiseZ = new NoiseModule(`${key}-z`, { ...noiseOptions, offset: new THREE.Vector3(0, 31.416, 0) });

      super((particle: Particle, deltaTime: number) => {
        const scrollSpeed = evaluateDynamicNumber(this.options.scrollSpeed ?? 0, particle.time, particle.id);
        const time = particle.realtime * scrollSpeed;

        this.noiseX.time = time;
        this.noiseY.time = time;
        this.noiseZ.time = time;
        this.noiseX.modify(particle, deltaTime);
        this.noiseY.modify(particle, deltaTime);
        this.noiseZ.modify(particle, deltaTime);

        const strength = evaluateDynamicVector(this.options.strength, particle.time, particle.id);
        if (this.options.damping) strength.multiplyScalar(1 / Math.max(this.options.frequency, 1));

        const force = new THREE.Vector3(
          (particle.noise[this.noiseX.key].noise4d * 2 - 1) * strength.x,
          (particle.noise[this.noiseY.key].noise4d * 2 - 1) * strength.y,
          (particle.noise[this.noiseZ.key].noise4d * 2 - 1) * strength.z,
        );

        particle.velocity.addScaledVector(force, deltaTime);
      });

      this.noiseX = noiseX;
      this.noiseY = noiseY;
      this.noiseZ = noiseZ;
    }
}

export default TransformByNoise;
