import Module from '../Module';
import evaluateDynamicNumber from '../helpers/evaluateDynamicNumber';
import ParticleForceField from '../ParticleForceField';
class ExternalForces extends Module {
    constructor(options) {
        var _a;
        super((particle, deltaTime) => {
            var _a;
            const multiplier = evaluateDynamicNumber((_a = this.multiplier) !== null && _a !== void 0 ? _a : 1, particle.time, particle.id);
            this.forceFields.forEach((forceField) => {
                particle.acceleration.addScaledVector(forceField.getForce(particle, deltaTime), multiplier);
            });
        }, options);
        this.multiplier = 1;
        this.forceFields = new Set();
        this.explicitForceFields = options.forceFields;
        this.forceFieldFilter = (_a = options.forceFieldFilter) !== null && _a !== void 0 ? _a : (() => true);
    }
    prepare(particleSystem, deltaTime) {
        var _a;
        // If explicit force fields are provided, just use those
        if (Array.isArray(this.explicitForceFields)) {
            this.forceFields = new Set(this.explicitForceFields);
            return;
        }
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
