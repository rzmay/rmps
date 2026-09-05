import * as THREE from 'three';
import Module from '../Module';
import evaluateDynamicNumber from '../helpers/evaluateDynamicNumber';
import ThreeCollisionBackend from '../collision/ThreeCollisionBackend';
class Collision extends Module {
    constructor(options = {}) {
        var _a, _b, _c, _d, _e, _f, _g;
        // Priority > 0, occurs after movement
        super((particle) => this.collide(particle), 1);
        this.dampen = 0;
        this.bounce = 1;
        this.lifetimeLoss = 0;
        this.applyImpulses = false;
        this.radiusScale = 1;
        this.minKillSpeed = 0;
        this.maxKillSpeed = Number.POSITIVE_INFINITY;
        this.collisionListeners = [];
        // Priority < 0, cache position before movement
        this.dependents = [new Module((particle) => particle.data["__rmps_collision_prevPosition"] = particle.position.clone())];
        this.dampen = (_a = options.dampen) !== null && _a !== void 0 ? _a : this.dampen;
        this.bounce = (_b = options.bounce) !== null && _b !== void 0 ? _b : this.bounce;
        this.lifetimeLoss = (_c = options.lifetimeLoss) !== null && _c !== void 0 ? _c : this.lifetimeLoss;
        this.applyImpulses = (_d = options.applyImpulses) !== null && _d !== void 0 ? _d : this.applyImpulses;
        this.radiusScale = (_e = options.radiusScale) !== null && _e !== void 0 ? _e : this.radiusScale;
        this.minKillSpeed = (_f = options.minKillSpeed) !== null && _f !== void 0 ? _f : this.minKillSpeed;
        this.maxKillSpeed = (_g = options.maxKillSpeed) !== null && _g !== void 0 ? _g : this.maxKillSpeed;
        if (options.onCollision)
            this.collisionListeners.push(options.onCollision);
    }
    onCollision(listener) {
        this.collisionListeners.push(listener);
    }
    removeCollisionListener(listener) {
        this.collisionListeners = this.collisionListeners.filter(l => l !== listener);
    }
    prepare(system, deltaTime) {
        var _a, _b;
        this._system = system;
        if (system.scene) {
            // Check if backend exists or needs to be updated
            const cachedBackend = system.scene.userData["__rmps_activeCollisionBackend"];
            if (!this.backend || this.backend != cachedBackend) {
                this.backend = cachedBackend !== null && cachedBackend !== void 0 ? cachedBackend : new ThreeCollisionBackend({ world: system.scene });
                system.scene.userData["__rmps_activeCollisionBackend"] =
                    this.backend;
            }
        }
        (_b = (_a = this.backend) === null || _a === void 0 ? void 0 : _a.update) === null || _b === void 0 ? void 0 : _b.call(_a, deltaTime);
    }
    collide(particle) {
        if (!this.backend || !this._system)
            return;
        const localStart = particle.data["__rmps_collision_prevPosition"];
        const localEnd = particle.position;
        if (localStart.equals(localEnd))
            return;
        this._system.updateWorldMatrix(true, false);
        const start = this._system.localToWorld(localStart.clone());
        const end = this._system.localToWorld(localEnd.clone());
        const radius = this.getParticleRadius(particle);
        const hit = this.backend.collide({
            particle,
            start,
            end,
            radius,
        });
        if (!hit)
            return;
        // Collision callbacks
        this.collisionListeners.forEach((listener) => listener(particle, hit));
        const inverseWorld = this._system.matrixWorld.clone().invert();
        hit.point = this._system.worldToLocal(hit.point.clone());
        if (hit.position) {
            hit.position = this._system.worldToLocal(hit.position.clone());
        }
        hit.normal = hit.normal
            .clone()
            .transformDirection(inverseWorld)
            .normalize();
        this.resolvePosition(particle, hit, radius);
        // Store previous veolocity for impulses
        const incomingVelocity = particle.velocity.clone();
        this.resolveVelocity(particle, hit);
        this.resolveLifetime(particle);
        if (particle.mass > 0
            && this.applyImpulses
            && this.backend.applyImpulse) {
            const impulse = particle.velocity
                .clone()
                .sub(incomingVelocity)
                .multiplyScalar(-particle.mass);
            this.backend.applyImpulse(hit, impulse);
        }
        const speed = particle.velocity.length();
        if (speed < this.minKillSpeed
            || speed > this.maxKillSpeed) {
            this.killParticle(particle);
        }
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
