import * as THREE from 'three';
import EmissionShape from './EmissionShape';
import Particle from './Particle';
import evaluateDynamicVector from './helpers/evaluateDynamicVector3';
import evaluateDynamicNumber from './helpers/evaluateDynamicNumber';
import evaluateDynamicColor from './helpers/evaluateDynamicColor';
import acceptMultiple from './helpers/acceptMultiple';
class Emitter {
    constructor(options = {}) {
        var _a, _b, _c, _d, _e, _f;
        this.source = (_a = options.source) !== null && _a !== void 0 ? _a : EmissionShape.Sphere();
        this.initialValues = (_b = options.initialValues) !== null && _b !== void 0 ? _b : { radial: 1 };
        this.rate = (_c = options.rate) !== null && _c !== void 0 ? _c : 50;
        this.bursts = acceptMultiple((_d = options.bursts) !== null && _d !== void 0 ? _d : []);
        this.duration = (_e = options.duration) !== null && _e !== void 0 ? _e : 10;
        this.looping = (_f = options.looping) !== null && _f !== void 0 ? _f : true;
        this._lastSpawn = Date.now();
        this._startTime = Date.now();
        document.addEventListener('visibilitychange', () => {
            const now = Date.now();
            const time = ((now - this._startTime) / (this.duration * 1000));
            if (now - this._lastSpawn > evaluateDynamicNumber(this.rate, time)) {
                this._lastSpawn = Date.now() - evaluateDynamicNumber(this.initialValues.lifetime, time) * 1000;
            }
        });
    }
    update(particles) {
        const now = Date.now();
        const time = ((now - this._startTime) / (this.duration * 1000));
        // Spawning
        if (now - this._startTime < this.duration * 1000) {
            // Rate
            const timeSinceLast = now - this._lastSpawn;
            const secondsPerParticle = (1000 / evaluateDynamicNumber(this.rate, time));
            const particlesDue = Math.floor(timeSinceLast / secondsPerParticle);
            for (let i = 0; i < particlesDue; i += 1) {
                this.spawnParticle(particles);
                this._lastSpawn = now;
            }
            // Bursts
            this.bursts.forEach((burst) => {
                if (!burst.fired && burst.time * this.duration * 1000 < now - this._startTime) {
                    for (let j = 0; j < burst.count; j += 1) {
                        this.spawnParticle(particles);
                    }
                    burst.fired = true;
                }
            });
        }
        else if (this.looping) {
            // Reset time
            this._startTime = now;
            // Reset bursts
            this.bursts.forEach((burst) => { burst.fired = false; });
        }
    }
    spawnParticle(particles) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        const now = Date.now();
        const time = ((now - this._startTime) / (this.duration * 1000));
        const point = this.source.getPoint();
        const position = point.position.clone();
        const normal = point.normal.clone();
        const defaultRotationQuat = (new THREE.Quaternion).setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
        const defaultRotationEuler = new THREE.Euler().setFromQuaternion(defaultRotationQuat, 'YXZ');
        const defaultRotation = new THREE.Vector3(defaultRotationEuler.x, defaultRotationEuler.y, defaultRotationEuler.z);
        const rotation = new THREE.Vector3(0, 0, 0).lerp(defaultRotation, Math.max(Math.min(evaluateDynamicNumber((_a = this.initialValues.alignment) !== null && _a !== void 0 ? _a : 0, time), 1), 0));
        const particle = new Particle({
            position,
            rotation: evaluateDynamicVector((_b = this.initialValues.rotation) !== null && _b !== void 0 ? _b : rotation, time),
            scale: evaluateDynamicVector((_c = this.initialValues.scale) !== null && _c !== void 0 ? _c : new THREE.Vector3(1, 1, 1), time),
            color: evaluateDynamicColor((_d = this.initialValues.color) !== null && _d !== void 0 ? _d : new THREE.Color(1, 1, 1), time),
            alpha: evaluateDynamicNumber((_e = this.initialValues.alpha) !== null && _e !== void 0 ? _e : 1, time),
            lifetime: evaluateDynamicNumber((_f = this.initialValues.lifetime) !== null && _f !== void 0 ? _f : 1, time),
        });
        particle.speed = evaluateDynamicNumber((_g = this.initialValues.speed) !== null && _g !== void 0 ? _g : 1, time);
        particle.velocity = evaluateDynamicVector((_h = this.initialValues.velocity) !== null && _h !== void 0 ? _h : new THREE.Vector3(0, 0, 0), time).clone()
            .add(normal.multiplyScalar(evaluateDynamicNumber((_j = this.initialValues.radial) !== null && _j !== void 0 ? _j : 0, time)));
        if (this.initialValues.angularVelocity)
            particle.angularVelocity = evaluateDynamicVector(this.initialValues.angularVelocity, time).clone();
        if (this.initialValues.scalarVelocity)
            particle.scalarVelocity = evaluateDynamicVector(this.initialValues.scalarVelocity, time).clone();
        if (this.initialValues.acceleration)
            particle.acceleration = evaluateDynamicVector(this.initialValues.acceleration, time).clone();
        if (this.initialValues.angularAcceleration)
            particle.angularAcceleration = evaluateDynamicVector(this.initialValues.angularAcceleration, time).clone();
        if (this.initialValues.scalarAcceleration)
            particle.scalarAcceleration = evaluateDynamicVector(this.initialValues.scalarAcceleration, time).clone();
        particle.cacheStartValues();
        particles.push(particle);
    }
}
export default Emitter;
