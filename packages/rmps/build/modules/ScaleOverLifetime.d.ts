import * as THREE from 'three';
import Module from '../Module';
import { DynamicValue } from '../types/DynamicValue';
export interface ScaleOverLifetimeOptions {
    scale: DynamicValue<THREE.Vector3>;
}
declare class ScaleOverLifetime extends Module {
    options: ScaleOverLifetimeOptions;
    constructor(options: ScaleOverLifetimeOptions);
}
export default ScaleOverLifetime;
