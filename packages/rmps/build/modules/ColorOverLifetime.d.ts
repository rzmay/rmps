import * as THREE from 'three';
import Module from '../Module';
import { DynamicValue } from '../types/DynamicValue';
export interface ColorOverLifetimeOptions {
    color?: DynamicValue<THREE.Color>;
    alpha?: DynamicValue<number>;
}
declare class ColorOverLifetime extends Module {
    options: ColorOverLifetimeOptions;
    constructor(options?: ColorOverLifetimeOptions);
}
export default ColorOverLifetime;
