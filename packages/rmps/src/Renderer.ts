import Particle from './Particle';
import ParticleSystem from './ParticleSystem';
import { StrictMultiple } from './types/Multiple';
import { Tag } from './types/Tag';
import acceptMultiple from './helpers/acceptMultiple';
import tagsIntersect from './helpers/tagsIntersect';

export interface RendererOptions {
    tags: StrictMultiple<Tag>;
}

export abstract class Renderer {
    tags?: Tag[];

    constructor(options: Partial<RendererOptions> = {}) {
        this.tags = acceptMultiple(options.tags);
    }

    // Runs once, when the renderer is added to the system
    public abstract setup(system: ParticleSystem): void;

    protected abstract _update(particles: Particle[], system: ParticleSystem): void;
    public update(particles: Particle[], system: ParticleSystem): void {
        // Call update on particles in the group
        this._update(particles.filter((p) => !this.tags || tagsIntersect(this.tags, p.tags ?? [])), system);
    }

    // Cleanup
    public abstract destroy(): void;
}
