import * as THREE from 'three';
import Module from '../Module';
import { DynamicValue } from '../types/DynamicValue';
export interface NoiseOptions {
    strength: DynamicValue<THREE.Vector3>;
    frequency: number;
    scrollSpeed?: DynamicValue<number>;
    octaves?: number;
    octaveMultiplier?: number;
    octaveScale?: number;
    damping?: boolean;
}
declare class TransformByNoise extends Module {
    options: NoiseOptions;
    private noiseX;
    private noiseY;
    private noiseZ;
    constructor(options: NoiseOptions);
}
export default TransformByNoise;
