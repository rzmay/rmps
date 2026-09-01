import * as THREE from 'three';
import Module from '../Module';
import { DynamicValue } from '../types/DynamicValue';
export interface RotationOverLifetimeOptions {
    angularVelocity: DynamicValue<THREE.Vector3>;
}
declare class RotationOverLifetime extends Module {
    options: RotationOverLifetimeOptions;
    constructor(options: RotationOverLifetimeOptions);
}
export default RotationOverLifetime;
