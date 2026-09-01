import * as THREE from 'three';
import evaluateDynamic from './evaluateDynamic';
export default function evaluateDynamicColor(value = new THREE.Color(), time = 0, seed = undefined) {
    return evaluateDynamic(value, (a, b, t) => (a.clone().add((b.clone().sub(a).multiplyScalar(t)))), time, seed);
}
