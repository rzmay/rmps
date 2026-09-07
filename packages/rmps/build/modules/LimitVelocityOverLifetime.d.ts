import * as THREE from 'three';
import Module, { ModuleOptions } from '../Module';
import { DynamicValue } from '../types/DynamicValue';
export interface LimitVelocityOverLifetimeOptions extends Partial<ModuleOptions> {
    limit: DynamicValue<THREE.Vector3>;
    dampen?: number;
    drag?: DynamicValue<number>;
    multiplyDragBySize?: boolean;
    multiplyDragByVelocity?: boolean;
}
declare class LimitVelocityOverLifetime extends Module {
    options: LimitVelocityOverLifetimeOptions;
    constructor(options: LimitVelocityOverLifetimeOptions);
    private dampenAxis;
}
export default LimitVelocityOverLifetime;
