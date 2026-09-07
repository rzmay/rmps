import * as THREE from 'three';
class JoltCollisionBackend {
    constructor(options) {
        var _a, _b, _c, _d, _e;
        this.destroyed = false;
        this.ownedFilters = [];
        this.Jolt = options.Jolt;
        this.physicsSystem = options.interface.GetPhysicsSystem();
        this.bodyInterface = this.physicsSystem.GetBodyInterface();
        const objectLayer = (_a = options.objectLayer) !== null && _a !== void 0 ? _a : 1;
        this.broadPhaseLayerFilter = (_b = options.broadPhaseLayerFilter) !== null && _b !== void 0 ? _b : new this.Jolt.DefaultBroadPhaseLayerFilter(options.interface.GetObjectVsBroadPhaseLayerFilter(), objectLayer);
        this.objectLayerFilter = (_c = options.objectLayerFilter) !== null && _c !== void 0 ? _c : new this.Jolt.DefaultObjectLayerFilter(options.interface.GetObjectLayerPairFilter(), objectLayer);
        this.bodyFilter = (_d = options.bodyFilter) !== null && _d !== void 0 ? _d : new this.Jolt.BodyFilter();
        this.shapeFilter = (_e = options.shapeFilter) !== null && _e !== void 0 ? _e : new this.Jolt.ShapeFilter();
        if (!options.broadPhaseLayerFilter) {
            this.ownedFilters.push(this.broadPhaseLayerFilter);
        }
        if (!options.objectLayerFilter) {
            this.ownedFilters.push(this.objectLayerFilter);
        }
        if (!options.bodyFilter) {
            this.ownedFilters.push(this.bodyFilter);
        }
        if (!options.shapeFilter) {
            this.ownedFilters.push(this.shapeFilter);
        }
        // These objects are invariant between casts, so allocate them once.
        this.scale = new this.Jolt.Vec3(1, 1, 1);
        this.baseOffset = new this.Jolt.RVec3(0, 0, 0);
        this.settings = new this.Jolt.ShapeCastSettings();
        this.settings.mReturnDeepestPoint = true;
        this.collector = new this.Jolt.CastShapeClosestHitCollisionCollector();
    }
    collide(query) {
        if (this.destroyed)
            return null;
        const movement = query.end.clone().sub(query.start);
        if (movement.lengthSq() === 0)
            return null;
        const shape = new this.Jolt.SphereShape(query.radius);
        const start = new this.Jolt.RVec3(query.start.x, query.start.y, query.start.z);
        const direction = new this.Jolt.Vec3(movement.x, movement.y, movement.z);
        const transform = this.Jolt.RMat44.prototype.sTranslation(start);
        const cast = new this.Jolt.RShapeCast(shape, this.scale, transform, direction);
        // Collector is reused between queries.
        this.collector.Reset();
        this.physicsSystem.GetNarrowPhaseQuery().CastShape(cast, this.settings, this.baseOffset, this.collector, this.broadPhaseLayerFilter, this.objectLayerFilter, this.bodyFilter, this.shapeFilter);
        if (!this.collector.HadHit()) {
            this._destroy(cast, transform, direction, start, shape);
            return null;
        }
        const hit = this.collector.mHit;
        // Jolt defines the contact normal as the negative normalized
        // penetration axis.
        const axis = hit.mPenetrationAxis;
        const normal = new THREE.Vector3(-axis.GetX(), -axis.GetY(), -axis.GetZ()).normalize();
        const position = query.start
            .clone()
            .addScaledVector(movement, hit.mFraction);
        if (hit.mPenetrationDepth > 0) {
            position.addScaledVector(normal, hit.mPenetrationDepth);
        }
        position.addScaledVector(normal, 1e-4);
        const contact = hit.mContactPointOn2;
        const point = new THREE.Vector3(contact.GetX(), contact.GetY(), contact.GetZ());
        // Copy this out as a plain JS number before the collector is reused.
        const bodyID = hit.mBodyID2.GetIndexAndSequenceNumber();
        const result = {
            point,
            normal,
            position,
            backendData: {
                bodyID,
            },
        };
        this._destroy(cast, transform, direction, start, shape);
        return result;
    }
    applyImpulse(hit, impulse) {
        if (this.destroyed)
            return;
        const data = hit.backendData;
        if (!data)
            return;
        const bodyID = new this.Jolt.BodyID(data.bodyID);
        const joltImpulse = new this.Jolt.Vec3(impulse.x, impulse.y, impulse.z);
        const point = new this.Jolt.RVec3(hit.point.x, hit.point.y, hit.point.z);
        this.bodyInterface.AddImpulse(bodyID, joltImpulse, point);
        // BodyID was previously leaked here.
        this._destroy(bodyID, joltImpulse, point);
    }
    destroy() {
        if (this.destroyed)
            return;
        this.destroyed = true;
        // Reusable query state owned by this backend.
        this._destroy(this.collector, this.settings, this.baseOffset, this.scale);
        // Only destroy filters that this backend created.
        this.ownedFilters.forEach((filter) => {
            this.Jolt.destroy(filter);
        });
        this.ownedFilters = [];
    }
    _destroy(...objects) {
        objects.forEach((object) => {
            if (object)
                this.Jolt.destroy(object);
        });
    }
}
export default JoltCollisionBackend;
