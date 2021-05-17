"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const THREE = require("three");
const EmissionShape_1 = require("./EmissionShape");
const Particle_1 = require("./Particle");
class Emitter {
    constructor(initialValues = {}, source = EmissionShape_1.default.Sphere, bursts = [], rate = 1, duration = 5, looping = true) {
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
        var _a, _b, _c, _d, _e, _f;
        const { position, normal } = this.source.getPoint();
        const zeroVector = new THREE.Vector3(0, 0, 0);
        const particle = new Particle_1.default(position, this.initialValues.rotation, this.initialValues.scale, this.initialValues.color, this.initialValues.alpha, this.initialValues.lifetime);
        particle.velocity = (_a = this.initialValues.velocity) !== null && _a !== void 0 ? _a : (this.initialValues.radial ? normal : zeroVector);
        particle.angularVelocity = (_b = this.initialValues.angularVelocity) !== null && _b !== void 0 ? _b : zeroVector;
        particle.scalarVelocity = (_c = this.initialValues.scalarVelocity) !== null && _c !== void 0 ? _c : zeroVector;
        particle.acceleration = (_d = this.initialValues.acceleration) !== null && _d !== void 0 ? _d : zeroVector;
        particle.angularAcceleration = (_e = this.initialValues.angularAcceleration) !== null && _e !== void 0 ? _e : zeroVector;
        particle.scalarAcceleration = (_f = this.initialValues.scalarAcceleration) !== null && _f !== void 0 ? _f : zeroVector;
        particles.push(particle);
    }
}
exports.default = Emitter;
