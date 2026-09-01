import * as THREE from 'three';
import { Renderer } from '../Renderer';
import Particle from '../Particle';
import ParticleSystem from '../ParticleSystem';
import { UnlitSpriteOptions } from '../materials/UnlitSprite';
import { BasicSpriteOptions } from '../materials/BasicSprite';
import { DynamicValue } from '../types/DynamicValue';
export interface SpriteRendererOptions {
    fps: DynamicValue<number>;
    tileSize: {
        x: number;
        y: number;
    };
    tileMargin: {
        x: number;
        y: number;
    };
    gridSize: {
        x: number;
        y: number;
    };
    frames: number;
    alphaMap: string | THREE.Texture;
    material: 'unlit' | 'basic';
    materialOptions: BasicSpriteOptions | UnlitSpriteOptions;
}
declare class SpriteRenderer extends Renderer {
    texture: THREE.Texture;
    frames: number;
    alphaMap?: THREE.Texture;
    materialType: 'unlit' | 'basic';
    tileSize: THREE.Vector2;
    tileMargin: THREE.Vector2;
    gridSize: THREE.Vector2;
    fps: DynamicValue<number>;
    private system?;
    private material;
    private _materialOptions;
    get materialOptions(): BasicSpriteOptions | UnlitSpriteOptions | undefined;
    set materialOptions(value: BasicSpriteOptions | UnlitSpriteOptions | undefined);
    private environmentSource?;
    private environmentRenderer?;
    private environmentRenderTarget?;
    private readonly geometry;
    private readonly points;
    constructor(texture?: string | THREE.Texture, options?: Partial<SpriteRendererOptions>);
    setup(system: ParticleSystem): void;
    update(particles: Particle[]): void;
    destroy(): void;
    private loadMaterial;
    private updateEnvironmentMap;
    private setEnvironmentMap;
}
export default SpriteRenderer;
