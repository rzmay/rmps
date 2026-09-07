import acceptMultiple from './helpers/acceptMultiple';
import tagsIntersect from './helpers/tagsIntersect';
export class Renderer {
    constructor(options = {}) {
        this.tags = acceptMultiple(options.tags);
    }
    update(particles, system) {
        // Call update on particles in the group
        this._update(particles.filter((p) => { var _a; return !this.tags || tagsIntersect(this.tags, (_a = p.tags) !== null && _a !== void 0 ? _a : []); }), system);
    }
}
