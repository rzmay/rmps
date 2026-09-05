import Particle from './Particle';
import ParticleSystem from './ParticleSystem';
import * as THREE from 'three';

export abstract class Renderer {
    // Runs once, when the renderer is added to the system
    public abstract setup(system: ParticleSystem): void;
    public abstract update(particles: Particle[], system: ParticleSystem): void;
    public abstract destroy(): void;
}
