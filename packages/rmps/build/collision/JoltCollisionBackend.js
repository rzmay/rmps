import * as THREE from 'three';
class JoltCollisionBackend {
    constructor(options) {
        this.jolt = options.jolt;
        this.physicsSystem = options.physicsSystem;
    }
    collide(query) {
        const movement = query.end.clone().sub(query.start);
        if (movement.lengthSq() === 0)
            return null;
        const shape = new this.jolt.SphereShape(query.radius, null);
        const scale = new this.jolt.Vec3(1, 1, 1);
        const start = new this.jolt.RVec3(query.start.x, query.start.y, query.start.z);
        const direction = new this.jolt.Vec3(movement.x, movement.y, movement.z);
        const transform = this.jolt.RMat44.prototype.sTranslation(start);
        const cast = new this.jolt.RShapeCast(shape, scale, transform, direction);
        const settings = new this.jolt.ShapeCastSettings();
        settings.mReturnDeepestPoint = true;
        const collector = new this.jolt.CastShapeClosestHitCollisionCollector();
        const baseOffset = new this.jolt.RVec3(0, 0, 0);
        this.physicsSystem
            .GetNarrowPhaseQuery()
            .CastShape(cast, settings, baseOffset, collector);
        if (!collector.HadHit()) {
            this.destroy(shape, scale, start, direction, transform, cast, settings, collector, baseOffset);
            return null;
        }
        const hit = collector.mHit;
        const fraction = hit.mFraction;
        const contact1 = hit.mContactPointOn1;
        const contact2 = hit.mContactPointOn2;
        const point = new THREE.Vector3(contact2.GetX(), contact2.GetY(), contact2.GetZ());
        const normal = new THREE.Vector3(contact1.GetX() - contact2.GetX(), contact1.GetY() - contact2.GetY(), contact1.GetZ() - contact2.GetZ());
        if (normal.lengthSq() === 0) {
            const axis = hit.mPenetrationAxis;
            normal.set(axis.GetX(), axis.GetY(), axis.GetZ());
        }
        normal.normalize();
        const position = query.start
            .clone()
            .addScaledVector(movement, fraction)
            .addScaledVector(normal, 1e-4);
        this.destroy(shape, scale, start, direction, transform, cast, settings, collector, baseOffset);
        return {
            point,
            normal,
            position,
        };
    }
    destroy(...objects) {
        objects.forEach((object) => {
            if (object)
                this.jolt.destroy(object);
        });
    }
}
export default JoltCollisionBackend;
