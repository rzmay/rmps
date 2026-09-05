import * as THREE from 'three';
import Jolt from '@barclah/jolt-physics';
import type { ICollisionBackend, CollisionHit, CollisionQuery } from 'rmps/src/interfaces/ICollisionBackend';
type JoltModule = Awaited<ReturnType<typeof Jolt>>;
export interface JoltCollisionBackendOptions {
    Jolt: JoltModule;
    interface: Jolt.JoltInterface;
    objectLayer?: number;
    broadPhaseLayerFilter?: Jolt.BroadPhaseLayerFilter;
    objectLayerFilter?: Jolt.ObjectLayerFilter;
    bodyFilter?: Jolt.BodyFilter;
    shapeFilter?: Jolt.ShapeFilter;
}
declare class JoltCollisionBackend implements ICollisionBackend {
    broadPhaseLayerFilter: Jolt.BroadPhaseLayerFilter;
    objectLayerFilter: Jolt.ObjectLayerFilter;
    bodyFilter: Jolt.BodyFilter;
    shapeFilter: Jolt.ShapeFilter;
    private Jolt;
    private physicsSystem;
    private bodyInterface;
    private scale;
    private baseOffset;
    private settings;
    private collector;
    private destroyed;
    private ownedFilters;
    constructor(options: JoltCollisionBackendOptions);
    collide(query: CollisionQuery): CollisionHit | null;
    applyImpulse(hit: CollisionHit, impulse: THREE.Vector3): void;
    destroy(): void;
    private _destroy;
}
export default JoltCollisionBackend;
