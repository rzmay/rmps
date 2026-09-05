import type { ICollisionBackend, CollisionHit, CollisionQuery } from 'rmps';
export interface AmmoLike {
    btSphereShape: new (radius: number) => any;
    btTransform: new () => any;
    btVector3: new (x: number, y: number, z: number) => any;
    ClosestConvexResultCallback: new (from: any, to: any) => any;
    destroy(object: any): void;
}
export interface AmmoWorldLike {
    convexSweepTest(shape: any, from: any, to: any, callback: any): void;
}
export interface AmmoCollisionBackendOptions {
    Ammo: any;
    world: any;
}
declare class AmmoCollisionBackend implements ICollisionBackend {
    private Ammo;
    private world;
    constructor(options: AmmoCollisionBackendOptions);
    collide(query: CollisionQuery): CollisionHit | null;
    private destroy;
}
export default AmmoCollisionBackend;
