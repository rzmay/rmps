import Module from '../Module';
import evaluateDynamicColor from '../helpers/evaluateDynamicColor';
import evaluateDynamicNumber from '../helpers/evaluateDynamicNumber';
class ColorOverLifetime extends Module {
    constructor(options = {}) {
        super((particle) => {
            if (this.options.color !== undefined) {
                particle.color = particle.start.color.clone().multiply(evaluateDynamicColor(this.options.color, particle.time, particle.id));
            }
            if (this.options.alpha !== undefined) {
                particle.alpha = particle.start.alpha * evaluateDynamicNumber(this.options.alpha, particle.time, particle.id);
            }
        }, options);
        this.options = options;
    }
}
export default ColorOverLifetime;
