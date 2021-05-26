import * as THREE from 'three';
declare class Particle {
    position: THREE.Vector3;
    rotation: THREE.Vector3;
    scale: THREE.Vector3;
    velocity: THREE.Vector3;
    angularVelocity: THREE.Vector3;
    scalarVelocity: THREE.Vector3;
    acceleration: THREE.Vector3;
    angularAcceleration: THREE.Vector3;
    scalarAcceleration: THREE.Vector3;
    speed: number;
    color: THREE.Color;
    alpha: number;
    startTime: number;
    lifetime: number;
    id: string;
    data: any;
    constructor(position: THREE.Vector3, rotation?: THREE.Vector3, scale?: THREE.Vector3, color?: THREE.Color, alpha?: number, lifetime?: number);
    update(deltaTime: number): void;
}
export default Particle;
