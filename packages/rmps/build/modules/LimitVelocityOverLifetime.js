import Module from '../Module';
import evaluateDynamicNumber from '../helpers/evaluateDynamicNumber';
import evaluateDynamicVector from '../helpers/evaluateDynamicVector3';
class LimitVelocityOverLifetime extends Module {
    constructor(options) {
        super((particle, deltaTime) => {
            var _a;
            const limit = evaluateDynamicVector(this.options.limit, particle.time, particle.id);
            const dampen = (_a = this.options.dampen) !== null && _a !== void 0 ? _a : 1;
            this.dampenAxis(particle.velocity, 'x', Math.abs(limit.x), dampen);
            this.dampenAxis(particle.velocity, 'y', Math.abs(limit.y), dampen);
            this.dampenAxis(particle.velocity, 'z', Math.abs(limit.z), dampen);
            if (this.options.drag !== undefined) {
                let drag = evaluateDynamicNumber(this.options.drag, particle.time, particle.id);
                if (this.options.multiplyDragBySize) {
                    drag *= (particle.scale.x + particle.scale.y + particle.scale.z) / 3;
                }
                if (this.options.multiplyDragByVelocity) {
                    drag *= particle.velocity.length();
                }
                particle.velocity.multiplyScalar(Math.max(0, 1 - drag * deltaTime));
            }
        });
        this.options = options;
    }
    // eslint-disable-next-line class-methods-use-this
    dampenAxis(velocity, axis, limit, dampen) {
        if (Math.abs(velocity[axis]) <= limit)
            return;
        const clamped = Math.sign(velocity[axis]) * limit;
        velocity[axis] += (clamped - velocity[axis]) * Math.min(Math.max(dampen, 0), 1);
    }
}
export default LimitVelocityOverLifetime;
