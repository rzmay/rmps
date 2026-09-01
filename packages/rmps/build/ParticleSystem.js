import * as THREE from 'three';
import Emitter from './Emitter';
import acceptMultiple from './helpers/acceptMultiple';
import SpriteRenderer from './renderers/SpriteRenderer';
import evaluateDynamicNumber from './helpers/evaluateDynamicNumber';
class ParticleSystem extends THREE.Object3D {
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
        this.gravity = (_d = options.gravity) !== null && _d !== void 0 ? _d : new THREE.Vector3(0, -9.8, 0);
        this.gravityModifier = (_e = options.gravityModifier) !== null && _e !== void 0 ? _e : 0;
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
            this.modules.forEach((module) => module.modify(particle, this.deltaTime));
            particle.velocity.addScaledVector(this.gravity, this.deltaTime * evaluateDynamicNumber(this.gravityModifier, particle.time, particle.id));
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
export default ParticleSystem;
