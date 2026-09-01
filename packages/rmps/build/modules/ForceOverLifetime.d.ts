import * as THREE from 'three';
import Module from '../Module';
import { DynamicValue } from '../types/DynamicValue';
export interface ForceOverLifetimeOptions {
    force: DynamicValue<THREE.Vector3>;
}
declare class ForceOverLifetime extends Module {
    options: ForceOverLifetimeOptions;
    constructor(options: ForceOverLifetimeOptions);
}
export default ForceOverLifetime;
