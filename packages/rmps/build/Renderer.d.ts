import Particle from './Particle';
import ParticleSystem from './ParticleSystem';
import { StrictMultiple } from './types/Multiple';
import { Tag } from './types/Tag';
export interface RendererOptions {
    tags: StrictMultiple<Tag>;
}
export declare abstract class Renderer {
    tags?: Tag[];
    constructor(options?: Partial<RendererOptions>);
    abstract setup(system: ParticleSystem): void;
    protected abstract _update(particles: Particle[], system: ParticleSystem): void;
    update(particles: Particle[], system: ParticleSystem): void;
    abstract destroy(): void;
}
