import * as THREE from 'three';
import { Renderer } from '../interfaces/Renderer';
import ParticleSystem from '../ParticleSystem';
import Particle from '../Particle';
declare class MeshRenderer implements Renderer {
    mesh: THREE.Mesh;
    instances: THREE.InstancedMesh;
    private dummy;
    constructor(mesh?: THREE.Mesh, maxParticles?: number);
    setup(system: ParticleSystem): void;
    update(particles: Particle[]): void;
}
export default MeshRenderer;
