import * as THREE from 'three';
import Emitter from './Emitter';
import acceptMultiple from './helpers/acceptMultiple';
import SpriteRenderer from './renderers/SpriteRenderer';
import evaluateDynamicNumber from './helpers/evaluateDynamicNumber';
class ParticleSystem extends THREE.Object3D {
    get scene() { return this._scene; }
    get sceneCamera() { return this._camera; }
    get sceneRenderer() { return this._renderer; }
    constructor(options = {}) {
        var _a, _b, _c, _d, _e;
        super();
        this.particles = [];
        this.emitters = [];
        this.modules = [];
        this.renderers = [];
        this.deltaTime = 0;
        this.emitters = acceptMultiple((_a = options.emitters) !== null && _a !== void 0 ? _a : new Emitter());
        this.renderers = acceptMultiple((_b = options.renderers) !== null && _b !== void 0 ? _b : new SpriteRenderer());
        this.modules = acceptMultiple((_c = options.modules) !== null && _c !== void 0 ? _c : []);
        // If gravity is passed in, gravityModifier will be set to 1.
        // In effect, this means gravity will be turned off by default,
        // but if either gravity or gravityModifier are specified, they will be used.
        this.gravity = (_d = options.gravity) !== null && _d !== void 0 ? _d : new THREE.Vector3(0, -9.81, 0);
        this.gravityModifier = (_e = options.gravityModifier) !== null && _e !== void 0 ? _e : (options.gravity ? 1 : 0);
        this.lastFrame = Date.now();
        this.emitters.forEach((e) => {
            e.setup(this);
        });
        this.renderers.forEach((r) => {
            r.setup(this);
        });
        // Store these here so that other renderers/modules can access easily
        // Dummy mesh that renders nothing allows us to catch the onBeforeRender hook
        const dummy = new THREE.Mesh();
        this.add(dummy);
        dummy.onBeforeRender = (renderer, scene, camera) => {
            this._renderer = renderer;
            this._scene = scene;
            this._camera = camera;
        };
        // Cleanup on remove from scene. Anything done here should not be permanent.
        // If the system is removed from one scene and added to another, it should
        // still function.
        this.addEventListener('removed', () => this.cleanup());
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
        // Moudle preparation
        this.modules
            .flatMap((module) => module.withDependents())
            .forEach((module) => module.prepare(this, this.deltaTime));
        // Particle processing
        this.particles.forEach((particle, index) => {
            this.modules
                .flatMap((module) => module.withDependents())
                .filter((module) => module.priority < 0)
                .forEach((module) => module.modify(particle, this.deltaTime));
            particle.velocity.addScaledVector(this.gravity, this.deltaTime * evaluateDynamicNumber(this.gravityModifier, particle.time, particle.id));
            particle.update(this.deltaTime);
            this.modules
                .flatMap((module) => module.withDependents())
                .filter((module) => module.priority >= 0)
                .sort((a, b) => a.priority - b.priority)
                .forEach((module) => module.modify(particle, this.deltaTime));
            if (Date.now() - particle.startTime > particle.lifetime * 1000) {
                this.particles.splice(index, 1);
            }
        });
        this.renderers.forEach((renderer) => {
            renderer.update(this.particles, this);
        });
    }
    addModule(module) {
        this.modules.push(module);
        return this;
    }
    removeModule(module) {
        const index = this.modules.indexOf(module);
        if (index !== -1) {
            this.modules.splice(index, 1);
            module.cleanup();
        }
        return this;
    }
    cleanup() {
        this.modules
            .flatMap((module) => module.withDependents())
            .forEach((module) => module.cleanup());
    }
}
export default ParticleSystem;
