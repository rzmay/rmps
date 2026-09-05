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
        var _a, _b, _c, _d;
        const min = Array.isArray(this.options.speedRange) ? this.options.speedRange[0] : (_b = (_a = this.options.speedRange) === null || _a === void 0 ? void 0 : _a.min) !== null && _b !== void 0 ? _b : 0;
        const max = Array.isArray(this.options.speedRange) ? this.options.speedRange[1] : (_d = (_c = this.options.speedRange) === null || _c === void 0 ? void 0 : _c.max) !== null && _d !== void 0 ? _d : 1;
        if (max === min)
            return speed >= max ? 1 : 0;
        return Math.min(Math.max((speed - min) / (max - min), 0), 1);
    }
}
export default RotationBySpeed;
