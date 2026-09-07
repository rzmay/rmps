import * as THREE from 'three';
import Module, { ModuleOptions } from '../Module';
import { DynamicValue } from '../types/DynamicValue';
import { NoiseOptions } from './NoiseModule';
export interface TransformByNoiseOptions extends Partial<ModuleOptions>, NoiseOptions {
    strength: DynamicValue<THREE.Vector3>;
    scrollSpeed: DynamicValue<number>;
    damping: boolean;
}
declare class TransformByNoise extends Module {
    options: Partial<TransformByNoiseOptions>;
    private noiseX;
    private noiseY;
    private noiseZ;
    constructor(options: Partial<TransformByNoiseOptions>);
}
export default TransformByNoise;
