import * as THREE from 'three';
import { Renderer } from '../interfaces/Renderer';
import Particle from '../Particle';
import ParticleSystem from '../ParticleSystem';
declare class SpriteRenderer implements Renderer {
    texture: THREE.Texture;
    private material;
    private readonly geometry;
    private readonly points;
    constructor(texture?: string | THREE.Texture);
    setup(system: ParticleSystem): void;
    update(particles: Particle[]): void;
}
export default SpriteRenderer;
