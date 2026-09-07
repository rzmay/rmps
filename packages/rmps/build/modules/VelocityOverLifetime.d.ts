import * as THREE from 'three';
import Module, { ModuleOptions } from '../Module';
import { DynamicValue } from '../types/DynamicValue';
export interface VelocityOverLifetimeOptions extends Partial<ModuleOptions> {
    linear: DynamicValue<THREE.Vector3>;
    orbital: DynamicValue<THREE.Vector3>;
    orbitOffset: DynamicValue<THREE.Vector3>;
    radial: DynamicValue<number>;
    speedModifier: DynamicValue<number>;
}
declare class VelocityOverLifetime extends Module {
    options: Partial<VelocityOverLifetimeOptions>;
    constructor(options?: Partial<VelocityOverLifetimeOptions>);
}
export default VelocityOverLifetime;
