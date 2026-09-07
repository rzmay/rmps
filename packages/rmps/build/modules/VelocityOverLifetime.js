import * as THREE from 'three';
import Module from '../Module';
import evaluateDynamicNumber from '../helpers/evaluateDynamicNumber';
import evaluateDynamicVector from '../helpers/evaluateDynamicVector3';
class VelocityOverLifetime extends Module {
    constructor(options = {}) {
        super((particle) => {
            var _a;
            const { time } = particle;
            const velocity = particle.start.velocity.clone();
            if (this.options.linear !== undefined) {
                velocity.add(evaluateDynamicVector(this.options.linear, time, particle.id).clone());
            }
            const offset = evaluateDynamicVector((_a = this.options.orbitOffset) !== null && _a !== void 0 ? _a : new THREE.Vector3(), time, particle.id).clone();
            const center = particle.start.position.clone().add(offset);
            const fromCenter = particle.position.clone().sub(center);
            if (this.options.orbital !== undefined && fromCenter.lengthSq() > 0) {
                const angularVelocity = evaluateDynamicVector(this.options.orbital, time, particle.id).clone();
                velocity.add(angularVelocity.cross(fromCenter.clone().normalize()));
            }
            if (this.options.radial !== undefined && fromCenter.lengthSq() > 0) {
                velocity.add(fromCenter.normalize().multiplyScalar(evaluateDynamicNumber(this.options.radial, time, particle.id)));
            }
            particle.velocity = velocity;
            if (this.options.speedModifier !== undefined) {
                particle.speed = particle.start.speed * evaluateDynamicNumber(this.options.speedModifier, time, particle.id);
            }
        }, options);
        this.options = options;
    }
}
export default VelocityOverLifetime;
