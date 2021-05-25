import * as THREE from 'three';
import { dynamicValue } from '../types/dynamicValue';
import evaluateDynamic from './evaluateDynamic';

export default function evaluateDynamicColor(value: dynamicValue<THREE.Color>, time: number = 0): THREE.Color {
  return evaluateDynamic<THREE.Color>(
    value,
    (a, b, t) => (a.add((b.sub(a).multiplyScalar(t)))),
    time,
  );
}
