import Module from '../Module';
import evaluateDynamicVector from '../helpers/evaluateDynamicVector3';
class ScaleBySpeed extends Module {
    constructor(options) {
        super((particle) => {
            particle.scale = particle.start.scale.clone().multiply(evaluateDynamicVector(this.options.size, this.getSpeedTime(particle.velocity.length()), particle.id));
        });
        this.options = options;
    }
    getSpeedTime(speed) {
        const min = Array.isArray(this.options.speedRange) ? this.options.speedRange[0] : this.options.speedRange.min;
        const max = Array.isArray(this.options.speedRange) ? this.options.speedRange[1] : this.options.speedRange.max;
        if (max === min)
            return speed >= max ? 1 : 0;
        return Math.min(Math.max((speed - min) / (max - min), 0), 1);
    }
}
export default ScaleBySpeed;
