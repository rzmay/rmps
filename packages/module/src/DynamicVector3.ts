import * as THREE from 'three';
import DynamicValue from './abstract/DynamicValue';
import { betweenValues } from './helpers/betweenValues';

class DynamicVector3 extends DynamicValue<THREE.Vector3> {
  protected evaluateBetween(time?: number): THREE.Vector3 {
    const value = this.value as betweenValues<DynamicValue<THREE.Vector3>>;
    const from = value.from.evaluate(time);
    const to = value.to.evaluate(time);

    const rand = Math.random();
    return new THREE.Vector3(
      from.x + (to.x - from.x) * rand,
      from.y + (to.y - from.y) * rand,
      from.z + (to.z - from.z) * rand,
    );
  }
}

export default DynamicVector3;
