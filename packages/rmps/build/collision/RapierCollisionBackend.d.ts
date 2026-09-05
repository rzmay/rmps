import type { ICollisionBackend, CollisionHit, CollisionQuery } from '../interfaces/ICollisionBackend';
export interface RapierCollisionBackendOptions {
    rapier: any;
    world: any;
}
declare class RapierCollisionBackend implements ICollisionBackend {
    private rapier;
    private world;
    constructor(options: RapierCollisionBackendOptions);
    collide(query: CollisionQuery): CollisionHit | null;
}
export default RapierCollisionBackend;
