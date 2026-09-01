import * as THREE from 'three';
import Module from '../Module';
import { DynamicValue } from '../types/DynamicValue';
export interface SizeOverLifetimeOptions {
    size: DynamicValue<THREE.Vector3>;
}
declare class SizeOverLifetime extends Module {
    options: SizeOverLifetimeOptions;
    constructor(options: SizeOverLifetimeOptions);
}
export default SizeOverLifetime;
