import * as THREE from 'three';
import Module, { ModuleOptions } from '../Module';
import { DynamicValue } from '../types/DynamicValue';
export interface ForceOverLifetimeOptions extends Partial<ModuleOptions> {
    force: DynamicValue<THREE.Vector3>;
}
declare class ForceOverLifetime extends Module {
    options: ForceOverLifetimeOptions;
    constructor(options: ForceOverLifetimeOptions);
}
export default ForceOverLifetime;
