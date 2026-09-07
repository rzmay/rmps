import Module from '../Module';
import evaluateDynamicVector from '../helpers/evaluateDynamicVector3';
class RotationOverLifetime extends Module {
    constructor(options) {
        super((particle) => {
            particle.angularVelocity = particle.start.angularVelocity.clone()
                .add(evaluateDynamicVector(this.options.angularVelocity, particle.time, particle.id));
        }, options);
        this.options = options;
    }
}
export default RotationOverLifetime;
