import * as THREE from 'three';
interface ParticleOptions {
    position: THREE.Vector3;
    rotation: THREE.Vector3;
    scale: THREE.Vector3;
    color: THREE.Color;
    alpha: number;
    lifetime: number;
}
export interface ParticleStartValues {
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
}
export interface ParticleNoiseValues {
    noise: number;
    noise4d: number;
}
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
    time: number;
    realtime: number;
    id: string;
    start: ParticleStartValues;
    noise: Record<string, ParticleNoiseValues>;
    data: any;
    constructor(options?: Partial<ParticleOptions>);
    cacheStartValues(): void;
    private createStartValues;
    update(deltaTime: number): void;
}
export default Particle;
