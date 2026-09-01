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

    private deltaTime = 0;

    private lastFrame: number;

    constructor(options: Partial<ParticleSystemOptions> = {}) {
      super();

      this.emitters = acceptMultiple(options.emitters ?? new Emitter());
      this.renderers = acceptMultiple(options.renderers ?? new SpriteRenderer());
      this.modules = acceptMultiple(options.modules ?? []);
      this.gravity = options.gravity ?? new THREE.Vector3(0, -9.8, 0);
      this.gravityModifier = options.gravityModifier ?? 0;

      this.lastFrame = Date.now();

      this.renderers.forEach((r) => {
        r.setup(this);
      });
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

      this.particles.forEach((particle, index) => {
        this.modules.forEach((module) => module.modify(particle, this.deltaTime));
        particle.velocity.addScaledVector(
          this.gravity,
          this.deltaTime * evaluateDynamicNumber(this.gravityModifier, particle.time, particle.id),
        );

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
