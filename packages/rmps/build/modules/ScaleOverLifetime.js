import Module from '../Module';
import evaluateDynamicVector from '../helpers/evaluateDynamicVector3';
class ScaleOverLifetime extends Module {
    constructor(options) {
        super((particle) => {
            particle.scale = particle.start.scale.clone().multiply(evaluateDynamicVector(this.options.scale, particle.time, particle.id));
        }, options);
        this.options = options;
    }
}
export default ScaleOverLifetime;
