import * as THREE from 'three';
import Module from '../Module';
import evaluateDynamicNumber from '../helpers/evaluateDynamicNumber';
import ParticleForceField from '../ParticleForceField';
class ExternalForces extends Module {
    constructor(options) {
        var _a;
        super((particle, deltaTime) => {
            var _a;
            const multiplier = evaluateDynamicNumber((_a = this.multiplier) !== null && _a !== void 0 ? _a : 1, particle.time, particle.id);
            const particleSystem = this.particleSystem;
            if (!particleSystem)
                return;
            particleSystem.updateWorldMatrix(true, false);
            const particlePosition = particleSystem.simulationSpace === 'world'
                ? particle.position
                : particleSystem.localToWorld(particle.position.clone());
            const worldQuaternion = particleSystem.simulationSpace === 'local'
                ? particleSystem.getWorldQuaternion(new THREE.Quaternion())
                : undefined;
            const inverseWorldQuaternion = worldQuaternion === null || worldQuaternion === void 0 ? void 0 : worldQuaternion.clone().invert();
            const forceParticle = particleSystem.simulationSpace === 'world'
                ? particle
                : Object.assign(Object.create(Object.getPrototypeOf(particle)), particle, {
                    position: particlePosition,
                    velocity: particle.velocity
                        .clone()
                        .applyQuaternion(worldQuaternion),
                });
            this.forceFields.forEach((forceField) => {
                const force = forceField.getForce(forceParticle, deltaTime);
                if (inverseWorldQuaternion) {
                    force.applyQuaternion(inverseWorldQuaternion);
                }
                particle.acceleration.addScaledVector(force, multiplier);
            });
        }, options);
        this.multiplier = 1;
        this.forceFields = new Set();
        this.explicitForceFields = options.forceFields;
        this.forceFieldFilter = (_a = options.forceFieldFilter) !== null && _a !== void 0 ? _a : (() => true);
    }
    prepare(particleSystem, deltaTime) {
        var _a;
        this.particleSystem = particleSystem;
        // If explicit force fields are provided, just use those
        if (Array.isArray(this.explicitForceFields)) {
            this.forceFields = new Set(this.explicitForceFields);
            return;
        }
        this.forceFields.clear();
        // Otherwise, scan the scene for force fields
        (_a = particleSystem.scene) === null || _a === void 0 ? void 0 : _a.traverse((object) => {
            var _a;
            if (object instanceof ParticleForceField
                && ((_a = this.forceFieldFilter) === null || _a === void 0 ? void 0 : _a.call(this, object)))
                this.forceFields.add(object);
        });
    }
}
export default ExternalForces;
