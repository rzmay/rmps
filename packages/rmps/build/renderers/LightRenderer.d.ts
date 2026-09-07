import * as THREE from 'three';
import { Renderer, RendererOptions } from '../Renderer';
import ParticleSystem from '../ParticleSystem';
import Particle from '../Particle';
import { DynamicValue } from '../types/DynamicValue';
export interface PointLightOptions {
    color?: THREE.Color | string | number;
    intensity?: number;
    distance?: number;
    decay?: number;
    power?: number;
}
export interface LightRendererOptions extends RendererOptions {
    brightness: DynamicValue<number>;
    rangeMultiplier: DynamicValue<number>;
    groupingRadiusRatio: number;
    decay: number;
    count: number;
    ratio: number;
    randomDistribution: boolean;
    inheritParticleColor: boolean;
    sizeAffectsRange: boolean;
    alphaAffectsIntensity: boolean;
    lightOptions: PointLightOptions;
}
declare class LightRenderer extends Renderer {
    lights: THREE.PointLight[];
    groupingRadiusRatio: number;
    brightness: DynamicValue<number>;
    rangeMultiplier: DynamicValue<number>;
    decay: number;
    ratio: number;
    randomDistribution: boolean;
    inheritParticleColor: boolean;
    sizeAffectsRange: boolean;
    alphaAffectsIntensity: boolean;
    lightOptions: PointLightOptions;
    private lightContainer;
    private _count;
    get count(): number;
    set count(value: number);
    constructor(options?: Partial<LightRendererOptions>);
    setup(system: ParticleSystem): void;
    _update(particles: Particle[]): void;
    private _createLight;
    private _getIntensity;
    private _getDistance;
    private _getLightParticles;
    private _getParticleGroups;
    private _getGroupingRadius;
    private _syncLightCount;
    destroy(): void;
}
export default LightRenderer;
