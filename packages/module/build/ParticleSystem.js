"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const THREE = require("three");
const Particle_1 = require("./Particle");
const acceptMultiple_1 = require("./helpers/acceptMultiple");
class ParticleSystem extends THREE.Object3D {
    constructor(emitter, renderer, modules) {
        super();
        this.particles = [];
        this.emitters = [];
        this.modules = [];
        this.renderers = [];
        this.deltaTime = 0;
        this.emitters = acceptMultiple_1.acceptMultiple(emitter);
        this.renderers = acceptMultiple_1.acceptMultiple(renderer);
        this.modules = acceptMultiple_1.acceptMultiple(modules);
        this.lastFrame = new Date().getTime();
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
        this.deltaTime = (new Date().getTime() - this.lastFrame) / 1000;
        this.lastFrame = (new Date().getTime());
    }
    update() {
        this.calculateDeltaTime();
        this.particles.forEach((particle) => {
            particle.update(this.deltaTime);
        });
        this.renderers.forEach((renderer) => {
            renderer.update(this.particles);
        });
    }
}
exports.default = ParticleSystem;
