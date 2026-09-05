import * as THREE from 'three';
import { Octree } from 'three/examples/jsm/math/Octree.js';
import { Capsule } from 'three/examples/jsm/math/Capsule.js';
import ParticleSystem from '../ParticleSystem';
var Classification;
(function (Classification) {
    Classification[Classification["Static"] = 0] = "Static";
    Classification[Classification["Dynamic"] = 1] = "Dynamic";
    Classification[Classification["Auto"] = 2] = "Auto";
})(Classification || (Classification = {}));
class ThreeCollisionBackend {
    constructor(options = {}) {
        var _a, _b, _c, _d;
        this.staticOctree = new Octree();
        this.dynamicOctree = new Octree();
        this.trackedObjects = new Map();
        this.elapsedTime = 0;
        this.dynamicUpdateAccumulator = 0;
        this.refreshAccumulator = 0;
        this.world = options.world;
        this.staticObjects = options.staticObjects;
        this.dynamicObjects = options.dynamicObjects;
        this.objectFilter = options.objectFilter;
        this.staticObjectFilter = options.staticObjectFilter;
        this.dynamicObjectFilter = options.dynamicObjectFilter;
        this.staticAfter = (_a = options.staticAfter) !== null && _a !== void 0 ? _a : 2;
        this.timeQuality = THREE.MathUtils.clamp((_b = options.timeQuality) !== null && _b !== void 0 ? _b : 1, Number.EPSILON, 1);
        this.refreshQuality = THREE.MathUtils.clamp((_d = (_c = options.refreshQuality) !== null && _c !== void 0 ? _c : options.timeQuality) !== null && _d !== void 0 ? _d : 1, Number.EPSILON, 1);
        this.initialize();
    }
    update(deltaTime) {
        this.elapsedTime += deltaTime;
        let staticMembershipChanged = false;
        let dynamicMembershipChanged = false;
        this.refreshAccumulator += this.refreshQuality;
        if (this.refreshAccumulator >= 1) {
            this.refreshAccumulator -= 1;
            const changes = this.refreshObjects();
            staticMembershipChanged || (staticMembershipChanged = changes.staticChanged);
            dynamicMembershipChanged || (dynamicMembershipChanged = changes.dynamicChanged);
        }
        for (const tracked of this.trackedObjects.values()) {
            tracked.object.updateWorldMatrix(true, false);
            if (tracked.classification !== Classification.Auto)
                continue;
            const moved = this.matrixChanged(tracked.matrixWorld, tracked.object.matrixWorld);
            if (moved) {
                tracked.matrixWorld.copy(tracked.object.matrixWorld);
                tracked.lastMovedAt = this.elapsedTime;
                if (!tracked.dynamic) {
                    tracked.dynamic = true;
                    staticMembershipChanged = true;
                    dynamicMembershipChanged = true;
                }
            }
            else if (tracked.dynamic
                && this.elapsedTime - tracked.lastMovedAt >= this.staticAfter) {
                tracked.dynamic = false;
                staticMembershipChanged = true;
                dynamicMembershipChanged = true;
            }
        }
        if (staticMembershipChanged) {
            this.rebuildStaticOctree();
        }
        if (dynamicMembershipChanged) {
            this.rebuildDynamicOctree();
            this.dynamicUpdateAccumulator = 0;
            return;
        }
        this.dynamicUpdateAccumulator += this.timeQuality;
        if (this.dynamicUpdateAccumulator >= 1) {
            this.dynamicUpdateAccumulator -= 1;
            this.rebuildDynamicOctree();
        }
    }
    collide(query) {
        const capsule = new Capsule(query.start.clone(), query.end.clone(), Math.max(query.radius, Number.EPSILON));
        const staticHit = this.staticOctree.capsuleIntersect(capsule);
        const dynamicHit = this.dynamicOctree.capsuleIntersect(capsule);
        if (!staticHit && !dynamicHit)
            return null;
        const collisionVector = new THREE.Vector3();
        if (staticHit) {
            collisionVector.addScaledVector(staticHit.normal, staticHit.depth);
        }
        if (dynamicHit) {
            collisionVector.addScaledVector(dynamicHit.normal, dynamicHit.depth);
        }
        if (collisionVector.lengthSq() === 0)
            return null;
        const normal = collisionVector.clone().normalize();
        const position = query.end
            .clone()
            .add(collisionVector);
        const point = position
            .clone()
            .addScaledVector(normal, -query.radius);
        return {
            point,
            normal,
            position,
        };
    }
    initialize() {
        this.refreshObjects();
        this.rebuildStaticOctree();
        this.rebuildDynamicOctree();
        this.dynamicUpdateAccumulator = 0;
        this.refreshAccumulator = 0;
    }
    refreshObjects() {
        const previous = this.trackedObjects;
        const next = new Map();
        if (this.hasExplicitLists()) {
            this.collectExplicitObjects(next, previous);
        }
        else if (this.world) {
            this.collectWorldObjects(next, previous);
        }
        let staticChanged = false;
        let dynamicChanged = false;
        const ids = new Set([
            ...previous.keys(),
            ...next.keys(),
        ]);
        for (const id of ids) {
            const before = previous.get(id);
            const after = next.get(id);
            if (!before && after) {
                if (after.dynamic)
                    dynamicChanged = true;
                else
                    staticChanged = true;
                continue;
            }
            if (before && !after) {
                if (before.dynamic)
                    dynamicChanged = true;
                else
                    staticChanged = true;
                continue;
            }
            if (!before || !after)
                continue;
            if (before.dynamic !== after.dynamic) {
                staticChanged = true;
                dynamicChanged = true;
            }
        }
        this.trackedObjects = next;
        return {
            staticChanged,
            dynamicChanged,
        };
    }
    hasExplicitLists() {
        return this.staticObjects !== undefined
            || this.dynamicObjects !== undefined;
    }
    collectExplicitObjects(target, previous) {
        var _a, _b;
        this.collectRoots((_a = this.staticObjects) !== null && _a !== void 0 ? _a : [], (mesh) => {
            this.trackObject(target, previous, mesh, Classification.Static);
        });
        this.collectRoots((_b = this.dynamicObjects) !== null && _b !== void 0 ? _b : [], (mesh) => {
            this.trackObject(target, previous, mesh, Classification.Dynamic);
        });
    }
    collectWorldObjects(target, previous) {
        if (!this.world)
            return;
        this.world.updateWorldMatrix(true, true);
        this.world.traverse((object) => {
            var _a, _b, _c, _d;
            if (!(object instanceof THREE.Mesh))
                return;
            if (object instanceof ParticleSystem)
                return;
            // Ideally, we ignore all helpers here.
            // Good god, what a mess
            if (object instanceof THREE.BoxHelper)
                return;
            if (object instanceof THREE.Box3Helper)
                return;
            if (object instanceof THREE.AxesHelper)
                return;
            if (object instanceof THREE.GridHelper)
                return;
            if (object instanceof THREE.ArrowHelper)
                return;
            if (object instanceof THREE.PlaneHelper)
                return;
            if (object instanceof THREE.CameraHelper)
                return;
            if (object instanceof THREE.SkeletonHelper)
                return;
            if (object instanceof THREE.PolarGridHelper)
                return;
            if (object instanceof THREE.DirectionalLightHelper)
                return;
            if (object instanceof THREE.HemisphereLightHelper)
                return;
            if (object instanceof THREE.SpotLightHelper)
                return;
            if (object instanceof THREE.PointLightHelper)
                return;
            // Check for renderer object
            if (object.userData["__rmps__trailRenderer"])
                return;
            if (object.userData["__rmps_spriteRenderer"])
                return;
            if (this.objectFilter
                && !this.objectFilter(object)) {
                return;
            }
            const isDynamic = (_b = (_a = this.dynamicObjectFilter) === null || _a === void 0 ? void 0 : _a.call(this, object)) !== null && _b !== void 0 ? _b : false;
            const isStatic = (_d = (_c = this.staticObjectFilter) === null || _c === void 0 ? void 0 : _c.call(this, object)) !== null && _d !== void 0 ? _d : false;
            if (isDynamic) {
                this.trackObject(target, previous, object, Classification.Dynamic);
                return;
            }
            if (isStatic) {
                this.trackObject(target, previous, object, Classification.Static);
                return;
            }
            this.trackObject(target, previous, object, Classification.Auto);
        });
    }
    collectRoots(roots, callback) {
        roots.forEach((root) => {
            root.updateWorldMatrix(true, true);
            root.traverse((object) => {
                if (!(object instanceof THREE.Mesh))
                    return;
                if (this.objectFilter
                    && !this.objectFilter(object)) {
                    return;
                }
                callback(object);
            });
        });
    }
    trackObject(target, previous, object, classification) {
        const existing = target.get(object.uuid);
        if ((existing === null || existing === void 0 ? void 0 : existing.classification) === Classification.Dynamic) {
            return;
        }
        const previousTracked = previous.get(object.uuid);
        object.updateWorldMatrix(true, false);
        if (classification === Classification.Auto
            && (previousTracked === null || previousTracked === void 0 ? void 0 : previousTracked.classification) === Classification.Auto) {
            target.set(object.uuid, {
                object,
                classification,
                dynamic: previousTracked.dynamic,
                matrixWorld: previousTracked.matrixWorld.clone(),
                lastMovedAt: previousTracked.lastMovedAt,
            });
            return;
        }
        target.set(object.uuid, {
            object,
            classification,
            dynamic: classification === Classification.Dynamic,
            matrixWorld: object.matrixWorld.clone(),
            lastMovedAt: this.elapsedTime,
        });
    }
    rebuildStaticOctree() {
        const objects = Array.from(this.trackedObjects.values())
            .filter((tracked) => !tracked.dynamic)
            .map((tracked) => tracked.object);
        this.staticOctree = this.buildOctree(objects);
    }
    rebuildDynamicOctree() {
        const objects = Array.from(this.trackedObjects.values())
            .filter((tracked) => tracked.dynamic)
            .map((tracked) => tracked.object);
        this.dynamicOctree = this.buildOctree(objects);
    }
    buildOctree(objects) {
        const octree = new Octree();
        let triangleCount = 0;
        objects.forEach((object) => {
            triangleCount += this.addMeshToOctree(octree, object);
        });
        if (triangleCount > 0) {
            octree.build();
        }
        return octree;
    }
    addMeshToOctree(octree, object) {
        object.updateWorldMatrix(true, false);
        const sourceGeometry = object.geometry;
        if (!(sourceGeometry instanceof THREE.BufferGeometry)) {
            return 0;
        }
        let geometry = sourceGeometry;
        let temporaryGeometry;
        if (sourceGeometry.index !== null) {
            temporaryGeometry = sourceGeometry.toNonIndexed();
            geometry = temporaryGeometry;
        }
        const position = geometry.getAttribute('position');
        if (!position) {
            temporaryGeometry === null || temporaryGeometry === void 0 ? void 0 : temporaryGeometry.dispose();
            return 0;
        }
        let count = 0;
        for (let i = 0; i + 2 < position.count; i += 3) {
            const a = new THREE.Vector3()
                .fromBufferAttribute(position, i)
                .applyMatrix4(object.matrixWorld);
            const b = new THREE.Vector3()
                .fromBufferAttribute(position, i + 1)
                .applyMatrix4(object.matrixWorld);
            const c = new THREE.Vector3()
                .fromBufferAttribute(position, i + 2)
                .applyMatrix4(object.matrixWorld);
            octree.addTriangle(new THREE.Triangle(a, b, c));
            count++;
        }
        temporaryGeometry === null || temporaryGeometry === void 0 ? void 0 : temporaryGeometry.dispose();
        return count;
    }
    matrixChanged(previous, current) {
        const a = previous.elements;
        const b = current.elements;
        for (let i = 0; i < 16; i++) {
            if (Math.abs(a[i] - b[i]) > 1e-6) {
                return true;
            }
        }
        return false;
    }
}
export default ThreeCollisionBackend;
