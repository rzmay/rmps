import * as THREE from 'three';
import type { ICollisionBackend, CollisionHit, CollisionQuery } from 'rmps';
export interface AmmoCollisionBackendOptions {
    Ammo: any;
    world: any;
}
declare class AmmoCollisionBackend implements ICollisionBackend {
    private Ammo;
    private world;
    constructor(options: AmmoCollisionBackendOptions);
    collide(query: CollisionQuery): CollisionHit | null;
    applyImpulse(hit: CollisionHit, impulse: THREE.Vector3): void;
    private _castRay;
    private _getSweepBasis;
    private _getRigidBody;
    private _destroy;
}
export default AmmoCollisionBackend;
