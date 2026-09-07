import * as THREE from 'three';
import Module, { ModuleOptions } from '../Module';
import { DynamicValue } from '../types/DynamicValue';
export interface ColorOverLifetimeOptions extends Partial<ModuleOptions> {
    color?: DynamicValue<THREE.Color>;
    alpha?: DynamicValue<number>;
}
declare class ColorOverLifetime extends Module {
    options: ColorOverLifetimeOptions;
    constructor(options?: ColorOverLifetimeOptions);
}
export default ColorOverLifetime;
