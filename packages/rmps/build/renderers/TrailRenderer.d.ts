import * as THREE from 'three';
import { Renderer } from '../Renderer';
import Particle from '../Particle';
import ParticleSystem from '../ParticleSystem';
import { DynamicValue } from '../types/DynamicValue';
export declare enum TrailMode {
    Particle = 0,
    Ribbon = 1
}
export declare enum TrailTextureMode {
    Stretch = 0,
    Tile = 1,
    RepeatPerSegment = 2,
    DistributePerSegment = 3
}
export interface TrailRendererOptions {
    mode: TrailMode;
    textureMode: TrailTextureMode;
    ratio: number;
    lifetime: DynamicValue<number>;
    minimumVertexDistance: number;
    dieWithParticles: boolean;
    ribbonCount: number;
    width: DynamicValue<number>;
    widthOverTrail: DynamicValue<number>;
    sizeAffectsWidth: boolean;
    sizeAffectsLifetime: boolean;
    inheritParticleColor: boolean;
    colorOverLifetime: DynamicValue<THREE.Color>;
    colorOverTrail: DynamicValue<THREE.Color>;
    material: THREE.Material;
    materialOptions: THREE.MeshStandardMaterialParameters;
    castShadow: boolean;
    receiveShadow: boolean;
}
declare class TrailRenderer extends Renderer {
    mode: TrailMode;
    ratio: number;
    lifetime: DynamicValue<number>;
    minimumVertexDistance: number;
    dieWithParticles: boolean;
    ribbonCount: number;
    textureMode: TrailTextureMode;
    width: DynamicValue<number>;
    sizeAffectsWidth: boolean;
    sizeAffectsLifetime: boolean;
    inheritParticleColor: boolean;
    colorOverLifetime: DynamicValue<THREE.Color>;
    widthOverTrail: DynamicValue<number>;
    colorOverTrail: DynamicValue<THREE.Color>;
    geometry: THREE.BufferGeometry;
    material: THREE.Material | THREE.Material[];
    mesh: THREE.Mesh;
    castShadow: boolean;
    receiveShadow: boolean;
    private particles;
    private trails;
    private camera?;
    constructor(options?: Partial<TrailRendererOptions>);
    setup(system: ParticleSystem): void;
    update(particles: Particle[]): void;
    destroy(): void;
    private updateParticleTrails;
    private addTrailPoint;
    private getPaths;
    private getParticlePaths;
    private getRibbonPaths;
    private rebuildGeometry;
    private appendPathGeometry;
    private getTangent;
    private getPerpendicular;
    private getTextureU;
    private getParticleSize;
    private particleHasTrail;
    private preprocessMaterial;
}
export default TrailRenderer;
