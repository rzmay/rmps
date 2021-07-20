"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const THREE = require("three");
const EmissionShape_1 = require("./EmissionShape");
const Particle_1 = require("./Particle");
const evaluateDynamicVector3_1 = require("./helpers/evaluateDynamicVector3");
const evaluateDynamicNumber_1 = require("./helpers/evaluateDynamicNumber");
const evaluateDynamicColor_1 = require("./helpers/evaluateDynamicColor");
class Emitter {
    constructor(initialValues = {}, source = EmissionShape_1.default.Sphere, bursts = [], rate = 50, duration = 10, looping = true) {
        this.source = source;
        this.initialValues = initialValues;
        this.rate = rate;
        this.bursts = bursts;
        this.duration = duration;
        this.looping = looping;
        this._lastSpawn = Date.now();
        this._startTime = Date.now();
    }
    update(particles) {
        const now = Date.now();
        // Spawning
        if (now - this._startTime < this.duration * 1000) {
            // Rate
            const timeSinceLast = now - this._lastSpawn;
            const secondsPerParticle = (1000 / this.rate);
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
        var _a, _b, _c, _d, _e, _f, _g;
        const now = Date.now();
        const time = ((now - this._startTime) / (this.duration * 1000));
        const { position, normal } = this.source.getPoint();
        const particle = new Particle_1.default(position, evaluateDynamicVector3_1.default((_a = this.initialValues.rotation) !== null && _a !== void 0 ? _a : new THREE.Vector3(0, 0, 0), time), evaluateDynamicVector3_1.default((_b = this.initialValues.scale) !== null && _b !== void 0 ? _b : new THREE.Vector3(1, 1, 1), time), evaluateDynamicColor_1.default((_c = this.initialValues.color) !== null && _c !== void 0 ? _c : new THREE.Color(1, 1, 1), time), evaluateDynamicNumber_1.default((_d = this.initialValues.alpha) !== null && _d !== void 0 ? _d : 1, time), evaluateDynamicNumber_1.default((_e = this.initialValues.lifetime) !== null && _e !== void 0 ? _e : 1, time));
        particle.velocity = evaluateDynamicVector3_1.default((_f = this.initialValues.velocity) !== null && _f !== void 0 ? _f : new THREE.Vector3(0, 0, 0), time)
            .add(normal.multiplyScalar(evaluateDynamicNumber_1.default((_g = this.initialValues.radial) !== null && _g !== void 0 ? _g : 0, time)));
        //
        // if (this.initialValues.angularVelocity) particle.angularVelocity = evaluateDynamicVector(this.initialValues.angularVelocity, time);
        // if (this.initialValues.scalarVelocity) particle.scalarVelocity = evaluateDynamicVector(this.initialValues.scalarVelocity, time);
        //
        // if (this.initialValues.acceleration) particle.acceleration = evaluateDynamicVector(this.initialValues.acceleration, time);
        // if (this.initialValues.angularAcceleration) particle.angularAcceleration = evaluateDynamicVector(this.initialValues.angularAcceleration, time);
        // if (this.initialValues.scalarAcceleration) particle.scalarAcceleration = evaluateDynamicVector(this.initialValues.scalarAcceleration, time);
        particles.push(particle);
    }
}
exports.default = Emitter;
