import Particle from './Particle';
import ParticleSystem from './ParticleSystem';
import { Tag } from './types/Tag';
import { StrictMultiple } from './types/Multiple';
export interface ModuleOptions {
    priority: number;
    tags: StrictMultiple<Tag>;
}
declare class Module {
    _modify: ((particle: Particle, deltaTime: number) => void);
    dependents: Module[];
    tags?: Tag[];
    priority: number;
    constructor(_modify: ((particle: Particle, deltaTime: number) => void), options?: Partial<ModuleOptions>);
    modify(particle: Particle, deltaTime: number): void;
    withDependents(): Module[];
    prepare(particleSystem: ParticleSystem, deltaTime: number): void;
    cleanup(): void;
}
export default Module;
