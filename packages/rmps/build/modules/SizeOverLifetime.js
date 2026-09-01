import Module from '../Module';
import evaluateDynamicVector from '../helpers/evaluateDynamicVector3';
class SizeOverLifetime extends Module {
    constructor(options) {
        super((particle) => {
            particle.scale = particle.start.scale.clone().multiply(evaluateDynamicVector(this.options.size, particle.time, particle.id));
        });
        this.options = options;
    }
}
export default SizeOverLifetime;
