import * as THREE from 'three';
export default interface InitialParticleValues {
    lifetime: number;
    speed: number;
    position: THREE.Vector3;
    rotation: THREE.Vector3;
    scale: THREE.Vector3;
    velocity: THREE.Vector3;
    angularVelocity: THREE.Vector3;
    scalarVelocity: THREE.Vector3;
    acceleration: THREE.Vector3;
    angularAcceleration: THREE.Vector3;
    scalarAcceleration: THREE.Vector3;
    color: THREE.Color;
    alpha: number;
    radial: boolean;
}
