import * as THREE from 'three';
import EmissionShape from './EmissionShape';
import Particle from './Particle';
import evaluateDynamicVector from './helpers/evaluateDynamicVector3';
import evaluateDynamicNumber from './helpers/evaluateDynamicNumber';
import evaluateDynamicColor from './helpers/evaluateDynamicColor';
import acceptMultiple from './helpers/acceptMultiple';
class Emitter {
    constructor(options = {}) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        this.tagSelection = 'all';
        this._lastTagIndex = 0;
        this._stopped = false;
        // Used for subsystems
        this._contextStates = new Map();
        this.source = (_a = options.source) !== null && _a !== void 0 ? _a : EmissionShape.Sphere();
        this.initialValues = (_b = options.initialValues) !== null && _b !== void 0 ? _b : {};
        this.rate = (_c = options.rate) !== null && _c !== void 0 ? _c : 50;
        this.bursts = (_d = acceptMultiple(options.bursts)) !== null && _d !== void 0 ? _d : [];
        this.duration = (_e = options.duration) !== null && _e !== void 0 ? _e : 10;
        this.looping = (_f = options.looping) !== null && _f !== void 0 ? _f : true;
        this.radialSpeed = (_g = options.radialSpeed) !== null && _g !== void 0 ? _g : 1;
        this.alignment = (_h = options.alignment) !== null && _h !== void 0 ? _h : 0;
        this.tags = acceptMultiple(options.tags);
        this.tagSelection = (_j = options.tagSelection) !== null && _j !== void 0 ? _j : this.tagSelection;
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
    /*
      * CONTROLS
    */
    start() {
        const now = Date.now();
        this._stopped = false;
        this._pausedAt = undefined;
        this._startTime = now;
        this._lastSpawn = now;
        this.bursts.forEach((burst) => {
            burst.fired = false;
        });
        this._contextStates.clear();
    }
    pause() {
        if (this._pausedAt !== undefined)
            return;
        this._pausedAt = Date.now();
    }
    resume() {
        if (this._pausedAt === undefined)
            return;
        const now = Date.now();
        const pausedDuration = now - this._pausedAt;
        this._startTime += pausedDuration;
        this._lastSpawn += pausedDuration;
        this._contextStates.forEach((state) => {
            state.startTime += pausedDuration;
            state.lastSpawn += pausedDuration;
        });
        this._pausedAt = undefined;
    }
    stop() {
        this._stopped = true;
        this._pausedAt = undefined;
        this._contextStates.clear();
        this.bursts.forEach((burst) => {
            burst.fired = false;
        });
    }
    /*
      * SIMULATION
    */
    setup(particleSystem) {
        particleSystem.add(this.source);
    }
    update(particles, context) {
        const now = Date.now();
        const time = ((now - this._startTime) / (this.duration * 1000));
        const spawned = [];
        // Spawning
        if (now - this._startTime < this.duration * 1000) {
            // Rate
            const timeSinceLast = now - this._lastSpawn;
            const secondsPerParticle = (1000 / evaluateDynamicNumber(this.rate, time));
            const particlesDue = Math.floor(timeSinceLast / secondsPerParticle);
            for (let i = 0; i < particlesDue; i += 1) {
                const particle = this.spawnParticle(particles, time, context);
                spawned.push(particle);
                this._lastSpawn = now;
            }
            // Bursts
            this.bursts.forEach((burst) => {
                if (!burst.fired && burst.time * this.duration * 1000 < now - this._startTime) {
                    const count = evaluateDynamicNumber(burst.count);
                    for (let j = 0; j < Math.floor(count); j += 1) {
                        const particle = this.spawnParticle(particles, time, context);
                        spawned.push(particle);
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
        return spawned;
    }
    updateAt(particles, context) {
        var _a, _b, _c;
        const now = Date.now();
        const state = this.getContextState((_a = context.key) !== null && _a !== void 0 ? _a : '__default', now);
        const duration = (_b = context.duration) !== null && _b !== void 0 ? _b : this.duration;
        const time = (_c = context.time) !== null && _c !== void 0 ? _c : ((now - state.startTime) / (duration * 1000));
        const spawned = [];
        if (context.time === undefined && now - state.startTime >= duration * 1000) {
            if (!this.looping)
                return spawned;
            state.startTime = now;
            state.lastSpawn = now;
            state.firedBursts.clear();
            return spawned;
        }
        const rate = evaluateDynamicNumber(this.rate, time);
        if (rate > 0) {
            const secondsPerParticle = 1000 / rate;
            const particlesDue = Math.floor((now - state.lastSpawn) / secondsPerParticle);
            for (let i = 0; i < particlesDue; i += 1) {
                const particle = this.spawnParticle(particles, time, context);
                spawned.push(particle);
            }
            if (particlesDue > 0)
                state.lastSpawn = now;
        }
        this.bursts.forEach((burst, index) => {
            if (!state.firedBursts.has(index) && burst.time <= time) {
                const count = evaluateDynamicNumber(burst.count);
                for (let i = 0; i < Math.floor(count); i += 1) {
                    const particle = this.spawnParticle(particles, time, context);
                    spawned.push(particle);
                }
                state.firedBursts.add(index);
            }
        });
        return spawned;
    }
    clearContext(key) {
        this._contextStates.delete(key);
    }
    getContextState(key, now) {
        let state = this._contextStates.get(key);
        if (!state) {
            state = {
                startTime: now,
                lastSpawn: now,
                firedBursts: new Set(),
            };
            this._contextStates.set(key, state);
        }
        return state;
    }
    spawnParticle(particles, time, context) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        const point = this.source.getPoint();
        const position = point.position.clone();
        const normal = point.normal.clone();
        if (context === null || context === void 0 ? void 0 : context.transform) {
            position.applyMatrix4(context.transform);
            normal.applyNormalMatrix(new THREE.Matrix3().getNormalMatrix(context.transform)).normalize();
        }
        const defaultRotationQuat = (new THREE.Quaternion).setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
        const defaultRotationEuler = new THREE.Euler().setFromQuaternion(defaultRotationQuat, 'YXZ');
        const defaultRotation = new THREE.Vector3(defaultRotationEuler.x, defaultRotationEuler.y, defaultRotationEuler.z);
        const rotation = new THREE.Vector3(0, 0, 0).lerp(defaultRotation, Math.max(Math.min(evaluateDynamicNumber(this.alignment, time), 1), 0));
        const color = evaluateDynamicColor((_a = this.initialValues.color) !== null && _a !== void 0 ? _a : new THREE.Color(1, 1, 1), time);
        if (context === null || context === void 0 ? void 0 : context.color) {
            color.multiply(context.color);
        }
        let alpha = evaluateDynamicNumber((_b = this.initialValues.alpha) !== null && _b !== void 0 ? _b : 1, time);
        if (context === null || context === void 0 ? void 0 : context.alpha) {
            alpha *= context.alpha;
        }
        let mass = evaluateDynamicNumber((_c = this.initialValues.mass) !== null && _c !== void 0 ? _c : 0, time);
        if (context === null || context === void 0 ? void 0 : context.mass) {
            mass *= context.mass;
        }
        const particle = new Particle(Object.assign({ position, rotation: evaluateDynamicVector((_d = this.initialValues.rotation) !== null && _d !== void 0 ? _d : rotation, time), scale: evaluateDynamicVector((_e = this.initialValues.scale) !== null && _e !== void 0 ? _e : new THREE.Vector3(1, 1, 1), time), lifetime: evaluateDynamicNumber((_f = this.initialValues.lifetime) !== null && _f !== void 0 ? _f : 1, time), color,
            alpha,
            mass }, (this.tags || (context === null || context === void 0 ? void 0 : context.tags) && {
            tags: [...((_g = context === null || context === void 0 ? void 0 : context.tags) !== null && _g !== void 0 ? _g : []), ...((_h = this._selectTags()) !== null && _h !== void 0 ? _h : [])],
        })));
        particle.speed = evaluateDynamicNumber((_j = this.initialValues.speed) !== null && _j !== void 0 ? _j : 1, time);
        particle.velocity = evaluateDynamicVector((_k = this.initialValues.velocity) !== null && _k !== void 0 ? _k : new THREE.Vector3(0, 0, 0), time).clone()
            .add(normal.multiplyScalar(evaluateDynamicNumber(this.radialSpeed, time)));
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
        return particle;
    }
    _selectTags() {
        if (!this.tags)
            return;
        switch (this.tagSelection) {
            case 'random':
                return [this.tags[Math.floor(Math.random() * this.tags.length)]];
            case 'distribute':
                this._lastTagIndex = (this._lastTagIndex + 1) % this.tags.length;
                return [this.tags[this._lastTagIndex]];
            case 'all':
            default:
                return this.tags;
        }
    }
}
export default Emitter;
