import { makeNoise4D } from 'fast-simplex-noise';
import Module from '../Module';
import Particle from '../Particle';

interface NoiseModuleParams {
    octaves: number;
    frequency: number;
    lacunarity: number;
    persistence: number;
}

class NoiseModule extends Module {
    public octaves = 1;

    public frequency = 1;

    public lacunarity = 2.0;

    public persistence = 0.5;

    private noiseGenerator = makeNoise4D();

    constructor(options: Partial<NoiseModuleParams>) {
      super((particle: Particle) => {
        particle.data.noise = this.generateNoise(particle);
        particle.data.noise4d = this.generateNoise(particle, true);
      });

      this.octaves = options?.octaves ?? this.octaves;
      this.frequency = options?.frequency ?? this.frequency;
      this.lacunarity = options?.lacunarity ?? this.lacunarity;
      this.persistence = options?.persistence ?? this.persistence;
    }

    private generateNoise(particle: Particle, w = false): number {
      let result = 0;
      for (let i = 0; i < this.octaves; i += 1) {
        const frequency = this.frequency * (this.lacunarity ** i);
        const amplitude = this.persistence ** i;
        result += (this.noiseGenerator(
          particle.position.x * frequency,
          particle.position.y * frequency,
          particle.position.z * frequency,
          w ? particle.time : 0,
        ) + 1) * 0.5 * amplitude;
      }

      return result;
    }
}

export default NoiseModule;
