import Module from '../Module';
import evaluateDynamicNumber from '../helpers/evaluateDynamicNumber';
class ExternalForces extends Module {
    constructor(options) {
        super((particle, deltaTime) => {
            var _a;
            const multiplier = evaluateDynamicNumber((_a = this.options.multiplier) !== null && _a !== void 0 ? _a : 1, particle.time, particle.id);
            this.options.forceFields.forEach((forceField) => {
                particle.acceleration.addScaledVector(forceField.getForce(particle, deltaTime), multiplier);
            });
        });
        this.options = options;
    }
}
export default ExternalForces;
