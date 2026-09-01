import * as THREE from 'three';
import evaluateDynamic from './evaluateDynamic';
export default function evaluateDynamicVector(value = new THREE.Vector3(), time = 0, seed = undefined) {
    return evaluateDynamic(value, (a, b, t) => (a.clone().add((b.clone().sub(a).multiplyScalar(t)))), time, seed);
}
