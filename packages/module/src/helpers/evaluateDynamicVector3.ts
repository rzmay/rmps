import * as THREE from 'three';
import { dynamicValue } from '../types/dynamicValue';
import evaluateDynamic from './evaluateDynamic';

export default function evaluateDynamicVector(
  value: dynamicValue<THREE.Vector3> = new THREE.Vector3(),
  time = 0,
): THREE.Vector3 {
  return evaluateDynamic<THREE.Vector3>(
    value,
    (a, b, t) => (a.add((b.sub(a).multiplyScalar(t)))),
    time,
  );
}
