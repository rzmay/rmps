"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const THREE = require("three");
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
