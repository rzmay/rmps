import Particle from './Particle';
import ParticleSystem from './ParticleSystem';
export declare abstract class Renderer {
    abstract setup(system: ParticleSystem): void;
    abstract update(particles: Particle[], system: ParticleSystem): void;
    abstract destroy(): void;
}
