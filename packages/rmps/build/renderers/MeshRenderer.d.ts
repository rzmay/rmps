import * as THREE from 'three';
import { Renderer, RendererOptions } from '../Renderer';
import ParticleSystem from '../ParticleSystem';
import Particle from '../Particle';
export interface MeshRendererOptions extends RendererOptions {
    mesh: THREE.Mesh;
    maxParticles: number;
    geometry: THREE.BufferGeometry;
    material: THREE.MeshStandardMaterial;
    materialOptions: THREE.MeshStandardMaterialParameters;
    castShadow: boolean;
    receiveShadow: boolean;
}
declare class MeshRenderer extends Renderer {
    mesh: THREE.Mesh;
    instances: THREE.InstancedMesh;
    castShadow: boolean;
    receiveShadow: boolean;
    private _alphaAttr;
    private dummy;
    constructor(options?: Partial<MeshRendererOptions>);
    setup(system: ParticleSystem): void;
    _update(particles: Particle[]): void;
    destroy(): void;
    private preprocessMaterial;
}
export default MeshRenderer;
