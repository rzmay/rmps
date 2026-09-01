import { makeNoise4D } from 'fast-simplex-noise';
import * as THREE from 'three';
import Module from '../Module';
class NoiseModule extends Module {
    constructor(key, options = {}) {
        var _a, _b, _c, _d, _e, _f;
        super((particle) => {
            particle.noise[key] = {
                noise: this.generateNoise(particle),
                noise4d: this.generateNoise(particle, true),
            };
        });
        this.octaves = 1;
        this.frequency = 1;
        this.lacunarity = 2.0;
        this.persistence = 0.5;
        this.time = 0;
        this.offset = new THREE.Vector3();
        this.noiseGenerator = makeNoise4D();
        this.key = key;
        this.octaves = (_a = options.octaves) !== null && _a !== void 0 ? _a : this.octaves;
        this.frequency = (_b = options.frequency) !== null && _b !== void 0 ? _b : this.frequency;
        this.lacunarity = (_c = options.lacunarity) !== null && _c !== void 0 ? _c : this.lacunarity;
        this.persistence = (_d = options.persistence) !== null && _d !== void 0 ? _d : this.persistence;
        this.time = (_e = options.time) !== null && _e !== void 0 ? _e : this.time;
        this.offset = (_f = options.offset) !== null && _f !== void 0 ? _f : this.offset;
    }
    generateNoise(particle, w = false) {
        const layers = [];
        for (let i = 0; i < this.octaves; i += 1) {
            const frequency = this.frequency * (Math.pow(this.lacunarity, i));
            const amplitude = Math.pow(this.persistence, i);
            // Clamp because float math is nuts
            const rawNoise = Math.min(Math.max((this.noiseGenerator((particle.position.x + this.offset.x) * frequency, (particle.position.y + this.offset.y) * frequency, (particle.position.z + this.offset.z) * frequency, w ? this.time : 0) + 1) / 2, 0), 1);
            layers.push({
                value: rawNoise * amplitude,
                weight: amplitude,
            });
        }
        // Use weighted average to maintain 0 - 1 range
        return layers.map((layer) => layer.value).reduce((a, b) => a + b)
            / layers.map((layer) => layer.weight).reduce((a, b) => a + b);
    }
}
export default NoiseModule;
