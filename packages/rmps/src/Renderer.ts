import Particle from './Particle';
import ParticleSystem from './ParticleSystem';
import * as THREE from 'three';

export abstract class Renderer {
    public abstract setup(system: ParticleSystem): void
    public abstract update(particles: Particle[]): void;
    public abstract destroy(): void;
}
