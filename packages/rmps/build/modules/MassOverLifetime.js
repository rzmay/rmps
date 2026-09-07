import Module from '../Module';
import evaluateDynamicNumber from '../helpers/evaluateDynamicNumber';
class MassOverLifetime extends Module {
    constructor(options) {
        super((particle) => {
            var _a;
            const sizeRatio = particle.scale.length() / particle.start.scale.length();
            particle.mass = particle.start.mass
                * evaluateDynamicNumber(this.options.mass, particle.time, particle.id)
                * (((_a = options.multiplyMassBySize) !== null && _a !== void 0 ? _a : true) ? sizeRatio : 1);
        }, options);
        this.options = options;
    }
}
export default MassOverLifetime;
