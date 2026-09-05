import * as THREE from 'three';
class AmmoCollisionBackend {
    constructor(options) {
    }
    collide(query) {
        const shape = new this.ammo.btSphereShape(query.radius);
        const from = new this.ammo.btTransform();
        const to = new this.ammo.btTransform();
        from.setIdentity();
        to.setIdentity();
        const fromPosition = new this.ammo.btVector3(query.start.x, query.start.y, query.start.z);
        const toPosition = new this.ammo.btVector3(query.end.x, query.end.y, query.end.z);
        from.setOrigin(fromPosition);
        to.setOrigin(toPosition);
        const callback = new this.ammo.ClosestConvexResultCallback(fromPosition, toPosition);
        this.world.convexSweepTest(shape, from, to, callback);
        if (!callback.hasHit()) {
            this.destroy(shape, from, to, fromPosition, toPosition, callback);
            return null;
        }
        const hitPoint = callback.get_m_hitPointWorld();
        const hitNormal = callback.get_m_hitNormalWorld();
        const point = new THREE.Vector3(hitPoint.x(), hitPoint.y(), hitPoint.z());
        const normal = new THREE.Vector3(hitNormal.x(), hitNormal.y(), hitNormal.z()).normalize();
        const fraction = callback.get_m_closestHitFraction();
        const position = query.start
            .clone()
            .lerp(query.end, fraction)
            .addScaledVector(normal, 1e-4);
        this.destroy(shape, from, to, fromPosition, toPosition, callback);
        return {
            point,
            normal,
            position,
        };
    }
    destroy(...objects) {
        objects.forEach((object) => this.ammo.destroy(object));
    }
}
export default AmmoCollisionBackend;
