import * as THREE from 'three';
import Particle from './Particle';
import Emitter from './Emitter';
import Module from './Module';
import { Renderer } from './Renderer';
import acceptMultiple from './helpers/acceptMultiple';
import SpriteRenderer from './renderers/SpriteRenderer';
import { multiple } from './types/multiple';
import { DynamicValue } from './types/DynamicValue';
import evaluateDynamicNumber from './helpers/evaluateDynamicNumber';
import ExternalForces from './modules/ExternalForces';

interface ParticleSystemOptions {
    emitters: multiple<Emitter>;
    renderers: multiple<Renderer>;
    modules: multiple<Module>;
    gravity: THREE.Vector3;
    gravityModifier: DynamicValue<number>;
}

class ParticleSystem extends THREE.Object3D {
    particles: Particle[] = [];

    emitters: Emitter[] = [];

    modules: Module[] = [];

    renderers: Renderer[] = [];

    gravity: THREE.Vector3;

    gravityModifier: DynamicValue<number>;

    private _scene?: THREE.Scene;
    get scene() { return this._scene; }

    private _camera?: THREE.Camera;
    get sceneCamera() { return this._camera; }

    private _renderer?: THREE.WebGLRenderer;
    get sceneRenderer() { return this._renderer; }

    private deltaTime = 0;

    private lastFrame: number;

    constructor(options: Partial<ParticleSystemOptions> = {}) {
      super();

      this.emitters = acceptMultiple(options.emitters ?? new Emitter());
      this.renderers = acceptMultiple(options.renderers ?? new SpriteRenderer());
      this.modules = acceptMultiple(options.modules ?? []);

      // If gravity is passed in, gravityModifier will be set to 1.
      // In effect, this means gravity will be turned off by default,
      // but if either gravity or gravityModifier are specified, they will be used.
      this.gravity = options.gravity ?? new THREE.Vector3(0, -9.81, 0);
      this.gravityModifier = options.gravityModifier ?? (options.gravity ? 1 : 0);

      this.lastFrame = Date.now();

      this.emitters.forEach((e) => {
        e.setup(this);
      })

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
      }

      // Cleanup on remove from scene. Anything done here should not be permanent.
      // If the system is removed from one scene and added to another, it should
      // still function.
      this.addEventListener('removed', () => this.cleanup());
    }

    private calculateDeltaTime() {
      this.deltaTime = (Date.now() - this.lastFrame) / 1000;
      this.lastFrame = (Date.now());
    }

    update(): void {
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

        particle.velocity.addScaledVector(
          this.gravity,
          this.deltaTime * evaluateDynamicNumber(this.gravityModifier, particle.time, particle.id),
        );

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

    public addModule(module: Module): this {
      this.modules.push(module);

      return this;
    }

    public removeModule(module: Module): this {
      const index = this.modules.indexOf(module);

      if (index !== -1) {
        this.modules.splice(index, 1);
        module.cleanup();
      }

      return this;
    }

    private cleanup(): void {
      this.modules
        .flatMap((module) => module.withDependents())
        .forEach((module) => module.cleanup());
    }
}

export default ParticleSystem;
