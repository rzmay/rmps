import Particle from '../Particle';
import ParticleSystem from '../ParticleSystem';
export default interface Renderer {
    setup(system: ParticleSystem): void;
    update(particles: Particle[]): void;
}
