import * as THREE from 'three';
import { Renderer } from '../Renderer';
import Particle from '../Particle';
import ParticleSystem from '../ParticleSystem';
import simple from '../assets/images/default.png';
import UnlitSprite, { UnlitSpriteOptions } from '../materials/UnlitSprite';
import BasicSprite, { BasicSpriteOptions } from '../materials/BasicSprite';
import { DynamicValue } from '../types/DynamicValue';
import evaluateDynamicNumber from '../helpers/evaluateDynamicNumber';

export interface SpriteRendererOptions {
  fps: DynamicValue<number>;
  tileSize: {x: number, y: number};
  tileMargin: {x: number, y: number};
  gridSize: {x: number, y: number};
  frames: number;
  alphaMap: string | THREE.Texture;
  material: 'unlit' | 'basic';
  materialOptions: BasicSpriteOptions | UnlitSpriteOptions;
}

class SpriteRenderer extends Renderer {
  texture: THREE.Texture;

  frames = 1;

  alphaMap?: THREE.Texture;

  materialType: 'unlit' | 'basic' = 'unlit';

  tileSize: THREE.Vector2 = new THREE.Vector2(0, 0);

  tileMargin: THREE.Vector2 = new THREE.Vector2(0, 0);

  gridSize: THREE.Vector2 = new THREE.Vector2(1, 1);

  fps: DynamicValue<number> = 1;

  private system?: ParticleSystem;

  private material: THREE.ShaderMaterial;

  private _materialOptions: BasicSpriteOptions | UnlitSpriteOptions | undefined;
  get materialOptions(): BasicSpriteOptions | UnlitSpriteOptions | undefined { return this._materialOptions; }
  set materialOptions(value: BasicSpriteOptions | UnlitSpriteOptions | undefined) {
    this._materialOptions = value;
    this.material = this.loadMaterial(value);
    this.points.material = this.material;
  }

  private environmentSource?: THREE.Texture;
  private environmentRenderer?: THREE.WebGLRenderer;
  private environmentRenderTarget?: THREE.WebGLRenderTarget;

  private readonly geometry: THREE.BufferGeometry;

  private readonly points: THREE.Points;

  constructor(texture: string | THREE.Texture = simple, options: Partial<SpriteRendererOptions> = {}) {
    super();

    const textureLoader = new THREE.TextureLoader();
    this.texture = typeof texture === 'string' ? textureLoader.load(texture, (tex) => {
      if (!options.tileSize) {
        this.tileSize = new THREE.Vector2(
          tex.image.naturalWidth / this.gridSize.x,
          tex.image.naturalHeight / this.gridSize.y,
        );
      }
    }) : texture;

    this.fps = options.fps ?? 1;
    this.alphaMap = typeof options.alphaMap === 'string'
      ? textureLoader.load(options.alphaMap)
      : options.alphaMap;
    this.materialType = options.material ?? this.materialType;
    this.tileSize = new THREE.Vector2(options.tileSize?.x, options.tileSize?.y);
    this.tileMargin = new THREE.Vector2(options.tileMargin?.x, options.tileMargin?.y);
    this.gridSize = new THREE.Vector2(options.gridSize?.x ?? 1, options.gridSize?.y ?? 1);

    this.frames = options.frames ?? this.gridSize.x * this.gridSize.y;

    this.geometry = new THREE.BufferGeometry();

    // Set material options and load material
    this._materialOptions = options.materialOptions;
    this.material = this.loadMaterial(this._materialOptions);
    this.points = new THREE.Points(this.geometry, this.material);
    this.points.frustumCulled = false;

    // Get a reference to the renderer
    this.points.onBeforeRender = (renderer, scene) => {
      if (!(renderer instanceof THREE.WebGLRenderer))
          return;

      const environment =
          this._materialOptions && 'envMap' in this._materialOptions
              ? this._materialOptions.envMap ?? scene.environment
              : scene.environment;

      this.updateEnvironmentMap(renderer, environment);
    };
  }

  setup(system: ParticleSystem) {
    system.add(this.points);
    this.system = system;
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
            particle.realtime * evaluateDynamicNumber(this.fps, particle.time, particle.id),
          ) % this.frames,
        ),
      ),
      1,
    ));
  }

  destroy(): void
  {
    this.environmentRenderTarget?.dispose();
    this.environmentRenderTarget = undefined;

    this.points.removeFromParent();
  }

  private loadMaterial(options: BasicSpriteOptions | UnlitSpriteOptions | undefined) {
    const createMaterial = this.materialType === 'basic' ? BasicSprite : UnlitSprite;

    return createMaterial(this.texture, {
      ...(options ?? {}),

      frames: this.frames,
      gridSize: this.gridSize,
      alphaMap: this.alphaMap,
    });
  }

  private updateEnvironmentMap(
    renderer: THREE.WebGLRenderer,
    environment: THREE.Texture | null
  ): void {
    if (this.materialType !== 'basic')
      return;

    if (
      environment === this.environmentSource
      && renderer === this.environmentRenderer
    ) {
      return;
    }

    this.environmentRenderTarget?.dispose();
    this.environmentRenderTarget = undefined;

    this.environmentSource = environment ?? undefined;
    this.environmentRenderer = renderer;

    if (!environment) {
      this.setEnvironmentMap(null);
      return;
    }

    // Already a PMREM CubeUV texture.
    if (environment.mapping === THREE.CubeUVReflectionMapping) {
      this.setEnvironmentMap(environment);
      return;
    }

    const pmremGenerator =
        new THREE.PMREMGenerator(renderer);

    let renderTarget: THREE.WebGLRenderTarget;

    if ((environment as THREE.CubeTexture).isCubeTexture) {
      renderTarget =
        pmremGenerator.fromCubemap(
          environment as THREE.CubeTexture
        );
    } else {
      renderTarget =
        pmremGenerator.fromEquirectangular(environment);
    }

    pmremGenerator.dispose();

    this.environmentRenderTarget = renderTarget;

    this.setEnvironmentMap(renderTarget.texture);
  }

  private setEnvironmentMap(
    environment: THREE.Texture | null
  ): void {
    if (this.materialType !== 'basic')
      return;

    this.material.uniforms.envMap.value = environment;
    this.material.uniforms.hasEnvMap.value = environment !== null;

    if (!environment) {
      delete this.material.defines?.ENVMAP_TYPE_CUBE_UV;
      delete this.material.defines?.CUBEUV_TEXEL_WIDTH;
      delete this.material.defines?.CUBEUV_TEXEL_HEIGHT;
      delete this.material.defines?.CUBEUV_MAX_MIP;

      this.material.needsUpdate = true;
      return;
    }

    const image = environment.source.data as {
        width: number;
        height: number;
    };

    const imageHeight = image.height;

    const maxMip =
      Math.log2(imageHeight) - 2;

    const texelHeight =
      1 / imageHeight;

    const texelWidth =
      1 / (
        3 * Math.max(
          Math.pow(2, maxMip),
          7 * 16
        )
      );

    this.material.defines ??= {};

    this.material.defines.ENVMAP_TYPE_CUBE_UV = '';
    this.material.defines.CUBEUV_TEXEL_WIDTH = `${texelWidth}`;
    this.material.defines.CUBEUV_TEXEL_HEIGHT = `${texelHeight}`;
    this.material.defines.CUBEUV_MAX_MIP = `${maxMip}.0`;

    this.material.needsUpdate = true;
  }
}

export default SpriteRenderer;
