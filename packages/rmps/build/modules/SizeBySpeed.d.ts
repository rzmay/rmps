import * as THREE from 'three';
import Module from '../Module';
import { DynamicValue } from '../types/DynamicValue';
import { SpeedRange } from './ColorBySpeed';
export interface SizeBySpeedOptions {
    size: DynamicValue<THREE.Vector3>;
    speedRange: SpeedRange;
}
declare class SizeBySpeed extends Module {
    options: SizeBySpeedOptions;
    constructor(options: SizeBySpeedOptions);
    private getSpeedTime;
}
export default SizeBySpeed;
