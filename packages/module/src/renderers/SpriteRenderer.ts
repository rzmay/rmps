import * as THREE from 'three';
import { Renderer } from '../interfaces/Renderer';
import Particle from '../Particle';
import ParticleSystem from '../ParticleSystem';
import simple from '../assets/images/simple.png';

class SpriteRenderer implements Renderer {
    texture: THREE.Texture;

    private geometry: THREE.BufferGeometry;

    private material: THREE.Material;

    private points: THREE.Points;

    constructor(texture: string | THREE.Texture = simple) {
      this.texture = typeof texture === 'string' ? new THREE.TextureLoader().load(texture) : texture;
      this.geometry = new THREE.BufferGeometry();
      this.material = new THREE.PointsMaterial({
        map: this.texture,
        color: new THREE.Color(0xff0000),
        size: 1,
        depthTest: true,
        depthWrite: false,
        transparent: true,
      });

      this.points = new THREE.Points(this.geometry, this.material);
    }

    setup(system: ParticleSystem) {
      system.add(this.points);
    }

    update(particles: Particle[]): void {
      this.geometry.setAttribute('position', new THREE.BufferAttribute(
        new Float32Array(
          particles.flatMap(
            (particle: Particle) => particle.position.toArray(),
          ),
        ),
        3,
      ));

      this.geometry.setAttribute('scale', new THREE.BufferAttribute(
        new Float32Array(
          particles.flatMap(
            (particle: Particle) => particle.scale.toArray(),
          ),
        ),
        3,
      ));

      this.geometry.setAttribute('rotation', new THREE.BufferAttribute(
        new Float32Array(
          particles.flatMap(
            (particle: Particle) => particle.rotation.toArray(),
          ),
        ),
        3,
      ));

      this.geometry.setAttribute('color', new THREE.BufferAttribute(
        new Float32Array(
          particles.flatMap(
            (particle: Particle) => particle.color.toArray().concat(particle.alpha),
          ),
        ),
        4,
      ));
    }
}

export default SpriteRenderer;
