import * as THREE from 'three';
import Module from '../Module';
interface NoiseModuleParams {
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
    constructor(key: string, options?: Partial<NoiseModuleParams>);
    private generateNoise;
}
export default NoiseModule;
