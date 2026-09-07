import * as THREE from 'three';
import Module from '../Module';
import evaluateDynamicNumber from '../helpers/evaluateDynamicNumber';
import evaluateDynamicVector from '../helpers/evaluateDynamicVector3';
import NoiseModule from './NoiseModule';
class TransformByNoise extends Module {
    constructor(options) {
        const key = `transformByNoise-${Math.random().toString(36).slice(2)}`;
        const noiseX = new NoiseModule(`${key}-x`, Object.assign(Object.assign({}, options), { offset: new THREE.Vector3(0, 0, 0) }));
        const noiseY = new NoiseModule(`${key}-y`, Object.assign(Object.assign({}, options), { offset: new THREE.Vector3(31.416, 0, 0) }));
        const noiseZ = new NoiseModule(`${key}-z`, Object.assign(Object.assign({}, options), { offset: new THREE.Vector3(0, 31.416, 0) }));
        super((particle, deltaTime) => {
            var _a, _b;
            const scrollSpeed = evaluateDynamicNumber((_a = this.options.scrollSpeed) !== null && _a !== void 0 ? _a : 0, particle.time, particle.id);
            const time = particle.realtime * scrollSpeed;
            this.noiseX.time = time;
            this.noiseY.time = time;
            this.noiseZ.time = time;
            const strength = evaluateDynamicVector(this.options.strength, particle.time, particle.id);
            if (this.options.damping)
                strength.multiplyScalar(1 / Math.max((_b = this.options.frequency) !== null && _b !== void 0 ? _b : 1, 1));
            const force = new THREE.Vector3((particle.noise[this.noiseX.key].noise4d * 2 - 1) * strength.x, (particle.noise[this.noiseY.key].noise4d * 2 - 1) * strength.y, (particle.noise[this.noiseZ.key].noise4d * 2 - 1) * strength.z);
            particle.velocity.addScaledVector(force, deltaTime);
        }, options);
        this.options = options;
        this.noiseX = noiseX;
        this.noiseY = noiseY;
        this.noiseZ = noiseZ;
        this.dependents.push(noiseX, noiseY, noiseZ);
    }
}
export default TransformByNoise;
