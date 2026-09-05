import type { ICollisionBackend, CollisionHit, CollisionQuery } from '../interfaces/ICollisionBackend';
export interface AmmoCollisionBackendOptions {
    ammo: any;
    world: any;
}
declare class AmmoCollisionBackend implements ICollisionBackend {
    private ammo;
    private world;
    constructor(options: AmmoCollisionBackendOptions);
    collide(query: CollisionQuery): CollisionHit | null;
    private destroy;
}
export default AmmoCollisionBackend;
