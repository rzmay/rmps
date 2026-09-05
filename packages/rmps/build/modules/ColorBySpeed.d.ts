import * as THREE from 'three';
import Module from '../Module';
import { DynamicValue } from '../types/DynamicValue';
export type SpeedRange = [number, number] | {
    min: number;
    max: number;
};
export interface ColorBySpeedOptions {
    color?: DynamicValue<THREE.Color>;
    alpha?: DynamicValue<number>;
    speedRange?: SpeedRange;
}
declare class ColorBySpeed extends Module {
    options: ColorBySpeedOptions;
    constructor(options: ColorBySpeedOptions);
    private getSpeedTime;
}
export default ColorBySpeed;
