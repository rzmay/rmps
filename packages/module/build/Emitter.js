"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EmissionShape_1 = require("./EmissionShape");
const Particle_1 = require("./Particle");
const evaluateDynamicVector3_1 = require("./helpers/evaluateDynamicVector3");
const evaluateDynamicNumber_1 = require("./helpers/evaluateDynamicNumber");
const evaluateDynamicColor_1 = require("./helpers/evaluateDynamicColor");
class Emitter {
    constructor(initialValues = {}, source = EmissionShape_1.default.Sphere, bursts = [], rate = 5, duration = 10, looping = true) {
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
        const now = Date.now();
        const time = (now - this._startTime / this.duration);
        const { position, normal } = this.source.getPoint();
        const particle = new Particle_1.default(position, evaluateDynamicVector3_1.default(this.initialValues.rotation, time), evaluateDynamicVector3_1.default(this.initialValues.scale, time), evaluateDynamicColor_1.default(this.initialValues.color, time), evaluateDynamicNumber_1.default(this.initialValues.alpha, time), evaluateDynamicNumber_1.default(this.initialValues.lifetime, time));
        particle.velocity = evaluateDynamicVector3_1.default(this.initialValues.velocity, time)
            .add(normal.multiplyScalar(evaluateDynamicNumber_1.default(this.initialValues.radial, time)));
        particle.angularVelocity = evaluateDynamicVector3_1.default(this.initialValues.angularVelocity, time);
        particle.scalarVelocity = evaluateDynamicVector3_1.default(this.initialValues.scalarVelocity, time);
        particle.acceleration = evaluateDynamicVector3_1.default(this.initialValues.acceleration, time);
        particle.angularAcceleration = evaluateDynamicVector3_1.default(this.initialValues.angularAcceleration, time);
        particle.scalarAcceleration = evaluateDynamicVector3_1.default(this.initialValues.scalarAcceleration, time);
        particles.push(particle);
    }
}
exports.default = Emitter;
