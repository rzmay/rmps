import Particle from './Particle';
import Module, { ModuleOptions } from './Module';
export interface GPUComputeModuleOptions extends ModuleOptions {
    useGPU: boolean;
    singleModify: ((particle: Particle, deltaTime: number) => void);
}
export default class GPUComputeModule extends Module {
    _gpuComputeModify: ((particles: Particle[], deltaTime: number) => void);
    useGPU: boolean;
    constructor(_gpuComputeModify: ((particles: Particle[], deltaTime: number) => void), options?: Partial<GPUComputeModuleOptions>);
    modify(particles: Particle[], deltaTime: number): void;
}
