import * as THREE from 'three';
import DynamicValue from './abstract/DynamicValue';
import { betweenValues } from './helpers/betweenValues';

class DynamicColor extends DynamicValue<THREE.Color> {
  protected evaluateBetween(time?: number): THREE.Color {
    const value = this.value as betweenValues<DynamicValue<THREE.Color>>;
    const from = value.from.evaluate(time);
    const to = value.to.evaluate(time);

    const rand = Math.random();
    return new THREE.Color(
      from.r + (to.r - from.r) * rand,
      from.g + (to.g - from.g) * rand,
      from.b + (to.b - from.b) * rand,
    );
  }
}

export default DynamicColor;
