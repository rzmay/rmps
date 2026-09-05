import * as THREE from 'three';
class RapierCollisionBackend {
    constructor(options) {
        this.RAPIER = options.RAPIER;
        this.world = options.world;
    }
    collide(query) {
        var _a, _b;
        const movement = query.end.clone().sub(query.start);
        if (movement.lengthSq() === 0)
            return null;
        const shape = new this.RAPIER.Ball(query.radius);
        const hit = this.world.castShape(query.start, {
            x: 0, y: 0, z: 0, w: 1,
        }, movement, shape, 0, 1, true);
        if (!hit)
            return null;
        const fraction = (_a = hit.time_of_impact) !== null && _a !== void 0 ? _a : 0;
        const position = query.start
            .clone()
            .addScaledVector(movement, fraction);
        const normal = new THREE.Vector3(hit.normal1.x, hit.normal1.y, hit.normal1.z).normalize();
        const point = position
            .clone()
            .addScaledVector(normal, -query.radius);
        return {
            point,
            normal,
            position: position.addScaledVector(normal, 1e-4),
            backendData: {
                body: (_b = hit.collider.parent()) !== null && _b !== void 0 ? _b : undefined,
            },
        };
    }
    // eslint-disable-next-line class-methods-use-this
    applyImpulse(hit, impulse) {
        const data = hit.backendData;
        const body = data === null || data === void 0 ? void 0 : data.body;
        if (!body || !body.isDynamic())
            return;
        body.applyImpulseAtPoint({
            x: impulse.x,
            y: impulse.y,
            z: impulse.z,
        }, {
            x: hit.point.x,
            y: hit.point.y,
            z: hit.point.z,
        }, true);
    }
}
export default RapierCollisionBackend;
