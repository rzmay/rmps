import * as THREE from 'three';
import Module from '../Module';
import evaluateDynamicNumber from '../helpers/evaluateDynamicNumber';
import ThreeCollisionBackend from '../collision/ThreeCollisionBackend';
import { getSceneFromObject } from '../helpers/getSceneFromObject';
const DATA_COLLISION_KEY = "_collision_prevPosition";
class Collision extends Module {
    constructor(options) {
        var _a, _b, _c, _d, _e, _f;
        // Priority > 0, occurs after movement
        super((particle) => this.collide(particle), 1);
        this.dampen = 0;
        this.bounce = 1;
        this.lifetimeLoss = 0;
        this.radiusScale = 1;
        this.minKillSpeed = 0;
        this.maxKillSpeed = Number.POSITIVE_INFINITY;
        // Priority < 0, cache position before movement
        this.dependents = [new Module((particle) => particle.data[DATA_COLLISION_KEY] = particle.position.clone())];
        this.dampen = (_a = options.dampen) !== null && _a !== void 0 ? _a : this.dampen;
        this.bounce = (_b = options.bounce) !== null && _b !== void 0 ? _b : this.bounce;
        this.lifetimeLoss = (_c = options.lifetimeLoss) !== null && _c !== void 0 ? _c : this.lifetimeLoss;
        this.radiusScale = (_d = options.radiusScale) !== null && _d !== void 0 ? _d : this.radiusScale;
        this.minKillSpeed = (_e = options.minKillSpeed) !== null && _e !== void 0 ? _e : this.minKillSpeed;
        this.maxKillSpeed = (_f = options.maxKillSpeed) !== null && _f !== void 0 ? _f : this.maxKillSpeed;
        this.onCollision = options.onCollision;
    }
    prepare(system, deltaTime) {
        var _a, _b, _c;
        if (!this.backend) {
            this.backend = new ThreeCollisionBackend({ world: (_a = getSceneFromObject(system)) !== null && _a !== void 0 ? _a : undefined });
        }
        (_c = (_b = this.backend).update) === null || _c === void 0 ? void 0 : _c.call(_b, deltaTime);
    }
    collide(particle) {
        var _a, _b, _c;
        if (!this.backend)
            return;
        const start = particle.data[DATA_COLLISION_KEY];
        const end = particle.position;
        if (start.equals(end))
            return;
        const radius = this.getParticleRadius(particle);
        const hit = this.backend.collide({
            particle,
            start,
            end,
            radius,
        });
        if (!hit)
            return;
        this.resolvePosition(particle, hit, radius);
        this.resolveVelocity(particle, hit);
        this.resolveLifetime(particle);
        const speed = particle.velocity.length();
        if (speed < ((_a = this.minKillSpeed) !== null && _a !== void 0 ? _a : 0)
            || speed > ((_b = this.maxKillSpeed) !== null && _b !== void 0 ? _b : Infinity)) {
            this.killParticle(particle);
        }
        (_c = this.onCollision) === null || _c === void 0 ? void 0 : _c.call(this, particle, hit);
    }
    resolvePosition(particle, hit, radius) {
        if (hit.position) {
            particle.position.copy(hit.position);
            return;
        }
        particle.position
            .copy(hit.point)
            .addScaledVector(hit.normal, radius);
    }
    resolveVelocity(particle, hit) {
        var _a, _b;
        const normal = hit.normal.clone().normalize();
        const bounce = THREE.MathUtils.clamp(evaluateDynamicNumber((_a = this.bounce) !== null && _a !== void 0 ? _a : 1, particle.time, particle.id), 0, 1);
        const dampen = THREE.MathUtils.clamp(evaluateDynamicNumber((_b = this.dampen) !== null && _b !== void 0 ? _b : 0, particle.time, particle.id), 0, 1);
        const normalSpeed = particle.velocity.dot(normal);
        /*
         * Don't bounce if we're already travelling away
         * from the surface.
         */
        if (normalSpeed >= 0)
            return;
        const normalVelocity = normal
            .clone()
            .multiplyScalar(normalSpeed);
        const tangentVelocity = particle.velocity
            .clone()
            .sub(normalVelocity);
        particle.velocity
            .copy(tangentVelocity)
            .addScaledVector(normalVelocity, -bounce)
            .multiplyScalar(1 - dampen);
    }
    resolveLifetime(particle) {
        var _a;
        const loss = THREE.MathUtils.clamp(evaluateDynamicNumber((_a = this.lifetimeLoss) !== null && _a !== void 0 ? _a : 0, particle.time, particle.id), 0, 1);
        if (loss === 0)
            return;
        particle.lifetime -= particle.start.lifetime * loss;
        if (particle.lifetime <= particle.realtime) {
            this.killParticle(particle);
        }
    }
    getParticleRadius(particle) {
        var _a;
        const size = Math.max(Math.abs(particle.scale.x), Math.abs(particle.scale.y), Math.abs(particle.scale.z));
        return size * 0.5 * ((_a = this.radiusScale) !== null && _a !== void 0 ? _a : 1);
    }
    killParticle(particle) {
        particle.lifetime = 0;
    }
}
export default Collision;
