import acceptMultiple from './helpers/acceptMultiple';
import tagsIntersect from './helpers/tagsIntersect';
class Module {
    constructor(_modify, options = {}) {
        var _a;
        this._modify = _modify;
        // Sub-modules on which this module depends.
        // Useful for pre-processing or combining priority stages.
        this.dependents = [];
        this.priority = -1;
        this.tags = acceptMultiple(options.tags);
        this.priority = (_a = options.priority) !== null && _a !== void 0 ? _a : this.priority;
    }
    modify(particle, deltaTime) {
        var _a;
        if (!this.tags || tagsIntersect(this.tags, (_a = particle.tags) !== null && _a !== void 0 ? _a : []))
            this._modify(particle, deltaTime);
    }
    // Process into array including self and dependents
    withDependents() {
        // Run dependents before this
        return [
            ...(this.dependents.flatMap(d => d.withDependents())),
            this,
        ];
    }
    // Optional preparation hook called once-per-update rather than per particle
    prepare(particleSystem, deltaTime) { }
    // Optional clean up hook for modules that require it
    cleanup() { }
}
export default Module;
