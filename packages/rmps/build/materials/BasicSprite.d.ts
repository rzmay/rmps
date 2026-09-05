import * as THREE from 'three';
export interface BasicSpriteOptions extends THREE.ShaderMaterialParameters {
    gridSize: {
        x: number;
        y: number;
    };
    frames: number;
    alphaMap: THREE.Texture;
    normalMap: THREE.Texture;
    normalStrength: number;
    normalLighting: number;
    sphericalNormals: boolean;
    roughness: number;
    roughnessMap: THREE.Texture;
    envMap: THREE.Texture;
    envIntensity: number;
    softParticles: boolean;
    softParticleDistance: number;
}
declare const BasicSprite: (texture: THREE.Texture, options?: Partial<BasicSpriteOptions>) => THREE.ShaderMaterial;
export default BasicSprite;
