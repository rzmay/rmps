import * as THREE from 'three';
import Module from '../Module';
import { DynamicValue } from '../types/DynamicValue';
import { SpeedRange } from './ColorBySpeed';
export interface ScaleBySpeedOptions {
    scale: DynamicValue<THREE.Vector3>;
    speedRange?: SpeedRange;
}
declare class ScaleBySpeed extends Module {
    options: ScaleBySpeedOptions;
    constructor(options: ScaleBySpeedOptions);
    private getSpeedTime;
}
export default ScaleBySpeed;
