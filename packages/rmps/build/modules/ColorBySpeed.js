import Module from '../Module';
import evaluateDynamicColor from '../helpers/evaluateDynamicColor';
import evaluateDynamicNumber from '../helpers/evaluateDynamicNumber';
class ColorBySpeed extends Module {
    constructor(options) {
        super((particle) => {
            const t = this.getSpeedTime(particle.velocity.length());
            if (this.options.color !== undefined) {
                particle.color = particle.start.color.clone().multiply(evaluateDynamicColor(this.options.color, t, particle.id));
            }
            if (this.options.alpha !== undefined) {
                particle.alpha = particle.start.alpha * evaluateDynamicNumber(this.options.alpha, t, particle.id);
            }
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
export default ColorBySpeed;
