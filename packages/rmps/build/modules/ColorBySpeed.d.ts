import * as THREE from 'three';
import Module, { ModuleOptions } from '../Module';
import { DynamicValue } from '../types/DynamicValue';
export type SpeedRange = [number, number] | {
    min: number;
    max: number;
};
export interface ColorBySpeedOptions extends Partial<ModuleOptions> {
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
