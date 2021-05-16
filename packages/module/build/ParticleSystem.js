"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const THREE = require("three");
const Particle_1 = require("./Particle");
const Emitter_1 = require("./Emitter");
const acceptMultiple_1 = require("./helpers/acceptMultiple");
const SpriteRenderer_1 = require("./renderers/SpriteRenderer");
class ParticleSystem extends THREE.Object3D {
    constructor(emitter = new Emitter_1.default({ radial: true }), renderer = new SpriteRenderer_1.default(), modules = []) {
        super();
        this.particles = [];
        this.emitters = [];
        this.modules = [];
        this.renderers = [];
        this.deltaTime = 0;
        this.emitters = acceptMultiple_1.acceptMultiple(emitter);
        this.renderers = acceptMultiple_1.acceptMultiple(renderer);
        this.modules = acceptMultiple_1.acceptMultiple(modules);
        this.lastFrame = Date.now();
        this.renderers.forEach((r) => {
            r.setup(this);
        });
        // TEMPORARY
        this.particles = new Array(10).fill(0).map((_, index) => {
            const particle = new Particle_1.default(new THREE.Vector3(index, 0, 0));
            particle.velocity = new THREE.Vector3(0, index, 0);
            particle.acceleration = new THREE.Vector3(0, -9.8, 0);
            return particle;
        });
    }
    calculateDeltaTime() {
        this.deltaTime = (Date.now() - this.lastFrame) / 1000;
        this.lastFrame = (Date.now());
    }
    update() {
        this.calculateDeltaTime();
        this.emitters.forEach((emitter) => {
            emitter.update(this.particles);
        });
        this.particles.forEach((particle, index) => {
            particle.update(this.deltaTime);
            if (Date.now() - particle.startTime > particle.lifetime * 1000) {
                this.particles.splice(index, 1);
            }
        });
        this.renderers.forEach((renderer) => {
            renderer.update(this.particles);
        });
    }
}
exports.default = ParticleSystem;
