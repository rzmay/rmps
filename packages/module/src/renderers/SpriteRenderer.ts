import * as THREE from 'three';
import { Renderer } from '../interfaces/Renderer';
import Particle from '../Particle';
import ParticleSystem from '../ParticleSystem';
import simple from '../assets/images/simple.png';
import UnlitSprite from '../materials/UnlitSprite';
import { dynamicValue } from '../types/dynamicValue';
import evaluateDynamicNumber from '../helpers/evaluateDynamicNumber';

interface SpriteRendererOptions {
    fps: dynamicValue<number>;
    tileSize: {x: number, y: number};
    tileMargin: {x: number, y: number};
    gridSize: {x: number, y: number};
    frames: number;
}

class SpriteRenderer implements Renderer {
    texture: THREE.Texture;

    frames = 1;

    tileSize: THREE.Vector2 = new THREE.Vector2(0, 0);

    tileMargin: THREE.Vector2 = new THREE.Vector2(0, 0);

    gridSize: THREE.Vector2 = new THREE.Vector2(1, 1);

    fps: dynamicValue<number> = 1;

    private material: THREE.Material;

    private readonly geometry: THREE.BufferGeometry;

    private readonly points: THREE.Points;

    constructor(texture: string | THREE.Texture = simple, options: Partial<SpriteRendererOptions> = {}) {
      this.texture = typeof texture === 'string' ? new THREE.TextureLoader().load(texture, (tex) => {
        if (!options.tileSize) {
          this.tileSize = new THREE.Vector2(
            tex.image.naturalWidth / this.gridSize.x,
            tex.image.naturalHeight / this.gridSize.y,
          );
        }

        // Load
        UnlitSprite(this.texture, {
          frames: this.frames,
          gridSize: this.gridSize,
        }).then((material) => {
          this.material = material;
          this.points.material = this.material;
        });
      }) : texture;

      this.fps = options.fps ?? 1;
      this.tileSize = new THREE.Vector2(options.tileSize?.x, options.tileSize?.y);
      this.tileMargin = new THREE.Vector2(options.tileMargin?.x, options.tileMargin?.y);
      this.gridSize = new THREE.Vector2(options.gridSize?.x ?? 1, options.gridSize?.y ?? 1);

      this.frames = options.frames ?? this.gridSize.x * this.gridSize.y;

      this.geometry = new THREE.BufferGeometry();

      // Preload
      this.material = new THREE.PointsMaterial({
        map: this.texture,
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

      this.geometry.setAttribute('frame', new THREE.BufferAttribute(
        new Float32Array(
          particles.flatMap(
            (particle: Particle) => Math.floor(
              particle.realtime * evaluateDynamicNumber(this.fps, particle.time),
            ) % this.frames,
          ),
        ),
        1,
      ));
    }
}

export default SpriteRenderer;
