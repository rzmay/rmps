import * as THREE from 'three';
class RapierCollisionBackend {
    constructor(options) {
        this.rapier = options.rapier;
        this.world = options.world;
    }
    collide(query) {
        var _a, _b, _c;
        const movement = query.end.clone().sub(query.start);
        if (movement.lengthSq() === 0)
            return null;
        const shape = new this.rapier.Ball(query.radius);
        const hit = this.world.castShape(query.start, { x: 0, y: 0, z: 0, w: 1 }, movement, shape, 0, 1, true);
        if (!hit)
            return null;
        const fraction = (_b = (_a = hit.time_of_impact) !== null && _a !== void 0 ? _a : hit.toi) !== null && _b !== void 0 ? _b : 0;
        const position = query.start.clone().addScaledVector(movement, fraction);
        const rawNormal = hit.normal1;
        const normal = new THREE.Vector3(rawNormal.x, rawNormal.y, rawNormal.z);
        if ((_c = hit.collider) === null || _c === void 0 ? void 0 : _c.rotation) {
            const rotation = hit.collider.rotation();
            normal.applyQuaternion(new THREE.Quaternion(rotation.x, rotation.y, rotation.z, rotation.w));
        }
        normal.normalize();
        return {
            point: position.clone().addScaledVector(normal, -query.radius),
            normal,
            position: position.addScaledVector(normal, 1e-4),
        };
    }
}
export default RapierCollisionBackend;
