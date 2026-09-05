import * as THREE from 'three';
import { Octree } from 'three/examples/jsm/math/Octree.js';
import { ICollisionBackend, CollisionHit, CollisionQuery } from '../interfaces/ICollisionBackend';
export interface ThreeCollisionBackendOptions {
    world?: THREE.Object3D;
    staticObjects?: THREE.Object3D[];
    dynamicObjects?: THREE.Object3D[];
    staticAfter?: number;
    timeQuality?: number;
    refreshQuality?: number;
    objectFilter?: (object: THREE.Object3D) => boolean;
    staticObjectFilter?: (object: THREE.Object3D) => boolean;
    dynamicObjectFilter?: (object: THREE.Object3D) => boolean;
}
declare class ThreeCollisionBackend implements ICollisionBackend {
    staticOctree: Octree;
    dynamicOctree: Octree;
    world?: THREE.Object3D;
    staticObjects?: THREE.Object3D[];
    dynamicObjects?: THREE.Object3D[];
    objectFilter?: (object: THREE.Object3D) => boolean;
    staticObjectFilter?: (object: THREE.Object3D) => boolean;
    dynamicObjectFilter?: (object: THREE.Object3D) => boolean;
    staticAfter: number;
    timeQuality: number;
    refreshQuality: number;
    private trackedObjects;
    private elapsedTime;
    private dynamicUpdateAccumulator;
    private refreshAccumulator;
    constructor(options?: ThreeCollisionBackendOptions);
    update(deltaTime: number): void;
    collide(query: CollisionQuery): CollisionHit | null;
    private initialize;
    private refreshObjects;
    private hasExplicitLists;
    private collectExplicitObjects;
    private collectWorldObjects;
    private collectRoots;
    private trackObject;
    private rebuildStaticOctree;
    private rebuildDynamicOctree;
    private buildOctree;
    private addMeshToOctree;
    private matrixChanged;
}
export default ThreeCollisionBackend;
