import Module from '../Module';
import evaluateDynamicVector from '../helpers/evaluateDynamicVector3';
class ForceOverLifetime extends Module {
    constructor(options) {
        super((particle) => {
            particle.acceleration = particle.start.acceleration.clone()
                .add(evaluateDynamicVector(this.options.force, particle.time, particle.id));
        });
        this.options = options;
    }
}
export default ForceOverLifetime;
