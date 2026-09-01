import * as THREE from 'three';
import Module from '../Module';
import { DynamicValue } from '../types/DynamicValue';
export interface VelocityOverLifetimeOptions {
    linear?: DynamicValue<THREE.Vector3>;
    orbital?: DynamicValue<THREE.Vector3>;
    orbitOffset?: DynamicValue<THREE.Vector3>;
    radial?: DynamicValue<number>;
    speedModifier?: DynamicValue<number>;
}
declare class VelocityOverLifetime extends Module {
    options: VelocityOverLifetimeOptions;
    constructor(options?: VelocityOverLifetimeOptions);
}
export default VelocityOverLifetime;
