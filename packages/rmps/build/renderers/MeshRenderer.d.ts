import * as THREE from 'three';
import { Renderer } from '../Renderer';
import ParticleSystem from '../ParticleSystem';
import Particle from '../Particle';
interface MeshRendererOptions {
    mesh: THREE.Mesh;
    maxParticles: number;
    geometry: THREE.BufferGeometry;
    material: THREE.MeshStandardMaterial;
    materialOptions: THREE.MeshStandardMaterialParameters;
}
declare class MeshRenderer extends Renderer {
    mesh: THREE.Mesh;
    instances: THREE.InstancedMesh;
    private _alphaAttr;
    private dummy;
    constructor(options?: Partial<MeshRendererOptions>);
    setup(system: ParticleSystem): void;
    update(particles: Particle[]): void;
    destroy(): void;
    private preprocessMaterial;
}
export default MeshRenderer;
