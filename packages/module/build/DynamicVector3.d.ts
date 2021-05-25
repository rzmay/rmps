import * as THREE from 'three';
import DynamicValue from './abstract/DynamicValue';
declare class DynamicVector3 extends DynamicValue<THREE.Vector3> {
    protected evaluateBetween(time?: number): THREE.Vector3;
}
export default DynamicVector3;
