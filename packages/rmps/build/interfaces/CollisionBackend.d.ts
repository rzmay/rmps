import * as THREE from 'three';
import Particle from '../Particle';
export interface CollisionQuery {
    particle: Particle;
    start: THREE.Vector3;
    end: THREE.Vector3;
    radius: number;
}
export interface CollisionHit {
    point: THREE.Vector3;
    normal: THREE.Vector3;
    position?: THREE.Vector3;
    object?: THREE.Object3D;
}
export interface ICollisionBackend {
    collide(query: CollisionQuery): CollisionHit | null;
}
