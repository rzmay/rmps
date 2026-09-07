import * as THREE from 'three';
import Module, { ModuleOptions } from '../Module';
export interface NoiseOptions extends Partial<ModuleOptions> {
    octaves: number;
    frequency: number;
    lacunarity: number;
    persistence: number;
    time: number;
    offset: THREE.Vector3;
}
declare class NoiseModule extends Module {
    octaves: number;
    frequency: number;
    lacunarity: number;
    persistence: number;
    time: number;
    offset: THREE.Vector3;
    key: string;
    private noiseGenerator;
    constructor(key: string, options?: Partial<NoiseOptions>);
    private generateNoise;
}
export default NoiseModule;
