import * as THREE from 'three';
import Particle from './Particle';
import Emitter from './Emitter';
import Module from './Module';
import Renderer from './interfaces/Renderer';
import { acceptMultiple } from './helpers/acceptMultiple';

class ParticleSystem extends THREE.Object3D {
    particles: Particle[] = [];

    emitters: Emitter[] = [];

    modules: Module[] = [];

    renderers: Renderer[] = [];

    private deltaTime: number = 0;

    private lastFrame: number;

    constructor(
      emitter: Emitter | Emitter[],
      renderer: Renderer | Renderer[],
      modules: Module | Module[],
    ) {
      super();

      this.emitters = acceptMultiple(emitter);
      this.renderers = acceptMultiple(renderer);
      this.modules = acceptMultiple(modules);

      this.lastFrame = new Date().getTime();

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
      this.deltaTime = (new Date().getTime() - this.lastFrame) / 1000;
      this.lastFrame = (new Date().getTime());
    }

    update(): void {
      this.calculateDeltaTime();

      this.particles.forEach((particle) => {
        particle.update(this.deltaTime);
      });

      this.renderers.forEach((renderer) => {
        renderer.update(this.particles);
      });
    }
}

export default ParticleSystem;
