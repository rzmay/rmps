import * as THREE from 'three';
import Particle from './Particle';
import Emitter from './Emitter';
import Module from './Module';
import { Renderer } from './interfaces/Renderer';
import acceptMultiple from './helpers/acceptMultiple';
import SpriteRenderer from './renderers/SpriteRenderer';
import { multiple } from './types/multiple';

interface ParticleSystemOptions {
    emitters: multiple<Emitter>;
    renderers: multiple<Renderer>;
    modules: multiple<Module>;
}

class ParticleSystem extends THREE.Object3D {
    particles: Particle[] = [];

    emitters: Emitter[] = [];

    modules: Module[] = [];

    renderers: Renderer[] = [];

    private deltaTime = 0;

    private lastFrame: number;

    constructor(options: Partial<ParticleSystemOptions> = {}) {
      super();

      this.emitters = acceptMultiple(options.emitters ?? new Emitter({ radial: 1 }));
      this.renderers = acceptMultiple(options.renderers ?? new SpriteRenderer());
      this.modules = acceptMultiple(options.modules ?? []);

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
