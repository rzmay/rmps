import * as THREE from 'three';
import Module from '../Module';
import { DynamicValue } from '../types/DynamicValue';
import { SpeedRange } from './ColorBySpeed';
export interface RotationBySpeedOptions {
    angularVelocity: DynamicValue<THREE.Vector3>;
    speedRange: SpeedRange;
}
declare class RotationBySpeed extends Module {
    options: RotationBySpeedOptions;
    constructor(options: RotationBySpeedOptions);
    private getSpeedTime;
}
export default RotationBySpeed;
