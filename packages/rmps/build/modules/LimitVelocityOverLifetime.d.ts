import * as THREE from 'three';
import Module from '../Module';
import { DynamicValue } from '../types/DynamicValue';
export interface LimitVelocityOverLifetimeOptions {
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
