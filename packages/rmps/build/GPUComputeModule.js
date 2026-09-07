import tagsIntersect from './helpers/tagsIntersect';
import Module from './Module';
const ERROR_MESSAGE = "Singular modifier not provided. Enable GPU computing on this module and particle system to use this module.";
export default class GPUComputeModule extends Module {
    constructor(_gpuComputeModify, options = {}) {
        var _a, _b;
        super((_a = options.singleModify) !== null && _a !== void 0 ? _a : (() => { console.warn(ERROR_MESSAGE); }), options);
        this._gpuComputeModify = _gpuComputeModify;
        this.useGPU = true;
        this.useGPU = (_b = options.useGPU) !== null && _b !== void 0 ? _b : this.useGPU;
    }
    modify(particles, deltaTime) {
        if (!this.useGPU)
            return super.modify(particles, deltaTime);
        this._gpuComputeModify(particles.filter((p) => { var _a; return !this.tags || tagsIntersect(this.tags, (_a = p.tags) !== null && _a !== void 0 ? _a : []); }), deltaTime);
    }
}
