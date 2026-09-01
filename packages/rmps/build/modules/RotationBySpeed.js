import Module from '../Module';
import evaluateDynamicVector from '../helpers/evaluateDynamicVector3';
class RotationBySpeed extends Module {
    constructor(options) {
        super((particle) => {
            particle.angularVelocity = particle.start.angularVelocity.clone().add(evaluateDynamicVector(this.options.angularVelocity, this.getSpeedTime(particle.velocity.length()), particle.id));
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
export default RotationBySpeed;
