import * as THREE from 'three';
export interface UnlitSpriteOptions {
    gridSize: {
        x: number;
        y: number;
    };
    frames: number;
    alphaMap: THREE.Texture;
    softParticles: boolean;
    softParticleDistance: number;
}
declare const UnlitSprite: (texture: THREE.Texture, options?: Partial<UnlitSpriteOptions>) => THREE.ShaderMaterial;
export default UnlitSprite;
