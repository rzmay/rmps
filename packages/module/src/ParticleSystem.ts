import * as THREE from 'three';
import Particle from './Particle';
import Emitter from './Emitter';
import Module from './Module';
import Renderer from './interfaces/Renderer';
import { acceptMultiple } from './helpers/acceptMultiple';
import SpriteRenderer from './renderers/SpriteRenderer';

class ParticleSystem extends THREE.Object3D {
    particles: Particle[] = [];

    emitters: Emitter[] = [];

    modules: Module[] = [];

    renderers: Renderer[] = [];

    private deltaTime: number = 0;

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

      // TEMPORARY
      this.particles = new Array(10).fill(0).map(
        (_, index) => {
          const particle = new Particle(new THREE.Vector3(index, 0, 0));
          particle.velocity = new THREE.Vector3(0, index, 0);
          particle.acceleration = new THREE.Vector3(0, -9.8, 0);
          return particle;
        },
      );
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
