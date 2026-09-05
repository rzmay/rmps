import * as THREE from 'three';
import type RAPIER from '@dimforge/rapier3d-compat';
import type { ICollisionBackend, CollisionHit, CollisionQuery } from 'rmps';
export interface RapierCollisionBackendOptions {
    RAPIER: (typeof RAPIER);
    world: RAPIER.World;
}
declare class RapierCollisionBackend implements ICollisionBackend {
    private RAPIER;
    private world;
    constructor(options: RapierCollisionBackendOptions);
    collide(query: CollisionQuery): CollisionHit | null;
    applyImpulse(hit: CollisionHit, impulse: THREE.Vector3): void;
}
export default RapierCollisionBackend;
