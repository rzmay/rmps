import Particle from '../Particle';
import ParticleSystem from '../ParticleSystem';

export interface Renderer {
    setup(system: ParticleSystem): void;
    update(particles: Particle[]): void;
}
