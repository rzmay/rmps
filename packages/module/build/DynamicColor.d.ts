import * as THREE from 'three';
import DynamicValue from './abstract/DynamicValue';
declare class DynamicColor extends DynamicValue<THREE.Color> {
    protected evaluateBetween(time?: number): THREE.Color;
}
export default DynamicColor;
