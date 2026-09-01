import * as THREE from 'three';
import Module from '../Module';
import evaluateDynamicNumber from '../helpers/evaluateDynamicNumber';
import evaluateDynamicVector from '../helpers/evaluateDynamicVector3';
import NoiseModule from './NoiseModule';
class TransformByNoise extends Module {
    constructor(options) {
        var _a, _b, _c;
        const noiseOptions = {
            octaves: (_a = options.octaves) !== null && _a !== void 0 ? _a : 1,
            frequency: options.frequency,
            lacunarity: (_b = options.octaveScale) !== null && _b !== void 0 ? _b : 2,
            persistence: (_c = options.octaveMultiplier) !== null && _c !== void 0 ? _c : 0.5,
        };
        const key = `transformByNoise-${Math.random().toString(36).slice(2)}`;
        const noiseX = new NoiseModule(`${key}-x`, Object.assign(Object.assign({}, noiseOptions), { offset: new THREE.Vector3(0, 0, 0) }));
        const noiseY = new NoiseModule(`${key}-y`, Object.assign(Object.assign({}, noiseOptions), { offset: new THREE.Vector3(31.416, 0, 0) }));
        const noiseZ = new NoiseModule(`${key}-z`, Object.assign(Object.assign({}, noiseOptions), { offset: new THREE.Vector3(0, 31.416, 0) }));
        super((particle, deltaTime) => {
            var _a;
            const scrollSpeed = evaluateDynamicNumber((_a = this.options.scrollSpeed) !== null && _a !== void 0 ? _a : 0, particle.time, particle.id);
            const time = particle.realtime * scrollSpeed;
            this.noiseX.time = time;
            this.noiseY.time = time;
            this.noiseZ.time = time;
            this.noiseX.modify(particle, deltaTime);
            this.noiseY.modify(particle, deltaTime);
            this.noiseZ.modify(particle, deltaTime);
            const strength = evaluateDynamicVector(this.options.strength, particle.time, particle.id);
            if (this.options.damping)
                strength.multiplyScalar(1 / Math.max(this.options.frequency, 1));
            const force = new THREE.Vector3((particle.noise[this.noiseX.key].noise4d * 2 - 1) * strength.x, (particle.noise[this.noiseY.key].noise4d * 2 - 1) * strength.y, (particle.noise[this.noiseZ.key].noise4d * 2 - 1) * strength.z);
            particle.velocity.addScaledVector(force, deltaTime);
        });
        this.options = options;
        this.noiseX = noiseX;
        this.noiseY = noiseY;
        this.noiseZ = noiseZ;
    }
}
export default TransformByNoise;
