import * as THREE from 'three';
import Particle from './Particle';
import Emitter from './Emitter';
import Module from './Module';
import { Renderer } from './interfaces/Renderer';
import { acceptMultiple } from './helpers/acceptMultiple';
import SpriteRenderer from './renderers/SpriteRenderer';
import EmissionShape from './EmissionShape';

class ParticleSystem extends THREE.Object3D {
    particles: Particle[] = [];

    emitters: Emitter[] = [];

    modules: Module[] = [];

    renderers: Renderer[] = [];

    private deltaTime = 0;

    private lastFrame: number;

    constructor(
      emitter: Emitter | Emitter[] = new Emitter({ radial: true }),
      renderer: Renderer | Renderer[] = new SpriteRenderer(),
      modules: Module | Module[] = [],
    ) {
      super();

      this.emitters = acceptMultiple(emitter);
      this.renderers = acceptMultiple(renderer);
      this.modules = acceptMultiple(modules);

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
