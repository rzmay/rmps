import Particle from './Particle';
import ParticleSystem from './ParticleSystem';
declare class Module {
    modify: ((particle: Particle, deltaTime: number) => void);
    priority: number;
    dependents: Module[];
    constructor(modify: ((particle: Particle, deltaTime: number) => void), priority?: number);
    withDependents(): Module[];
    prepare(particleSystem: ParticleSystem, deltaTime: number): void;
    cleanup(): void;
}
export default Module;
