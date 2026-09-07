import * as THREE from 'three';
import { Tag } from './types/Tag';
export interface ParticleOptions {
    position: THREE.Vector3;
    rotation: THREE.Vector3;
    scale: THREE.Vector3;
    color: THREE.Color;
    tags: Tag[];
    alpha: number;
    lifetime: number;
    mass: number;
}
export interface ParticleStartValues {
    lifetime: number;
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
    mass: number;
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
    mass: number;
    startTime: number;
    lifetime: number;
    time: number;
    realtime: number;
    id: string;
    start: ParticleStartValues;
    noise: Record<string, ParticleNoiseValues>;
    tags?: Tag[];
    data: any;
    constructor(options?: Partial<ParticleOptions>);
    cacheStartValues(): void;
    private createStartValues;
    update(deltaTime: number): void;
}
export default Particle;
