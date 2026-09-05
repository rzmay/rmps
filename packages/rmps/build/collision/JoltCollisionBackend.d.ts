import type { ICollisionBackend, CollisionHit, CollisionQuery } from '../interfaces/ICollisionBackend';
export interface JoltCollisionBackendOptions {
    jolt: any;
    physicsSystem: any;
}
declare class JoltCollisionBackend implements ICollisionBackend {
    private jolt;
    private physicsSystem;
    constructor(options: JoltCollisionBackendOptions);
    collide(query: CollisionQuery): CollisionHit | null;
    private destroy;
}
export default JoltCollisionBackend;
