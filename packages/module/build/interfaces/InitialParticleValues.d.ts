import * as THREE from 'three';
import { dynamicValue } from '../types/dynamicValue';
export interface InitialParticleValues {
    lifetime: dynamicValue<number>;
    speed: dynamicValue<number>;
    position: dynamicValue<THREE.Vector3>;
    rotation: dynamicValue<THREE.Vector3>;
    scale: dynamicValue<THREE.Vector3>;
    velocity: dynamicValue<THREE.Vector3>;
    angularVelocity: dynamicValue<THREE.Vector3>;
    scalarVelocity: dynamicValue<THREE.Vector3>;
    acceleration: dynamicValue<THREE.Vector3>;
    angularAcceleration: dynamicValue<THREE.Vector3>;
    scalarAcceleration: dynamicValue<THREE.Vector3>;
    color: dynamicValue<THREE.Color>;
    alpha: dynamicValue<number>;
    radial: dynamicValue<number>;
}
