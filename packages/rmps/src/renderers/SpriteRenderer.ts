import * as THREE from 'three';
import { Renderer, RendererOptions } from '../Renderer';
import Particle from '../Particle';
import ParticleSystem from '../ParticleSystem';
import simple from '../assets/images/default.png';
import UnlitSprite, { UnlitSpriteOptions } from '../materials/UnlitSprite';
import BasicSprite, { BasicSpriteOptions } from '../materials/BasicSprite';
import { DynamicValue } from '../types/DynamicValue';
import evaluateDynamicNumber from '../helpers/evaluateDynamicNumber';
import seedrandom from 'seedrandom';

type SceneDepthData = {
  target: THREE.WebGLRenderTarget;
  material: THREE.MeshDepthMaterial;
  frame: number;
  rendering: boolean;
};

type HiddenSpriteRenderer = {
  object: THREE.Object3D;
  visible: boolean;
};

const SPRITE_RENDERER_USER_DATA_KEY = "__rmps_spriteRenderer";
const SCENE_DEPTH_DATA_USER_DATA_KEY = "__rmps_sceneDepthData";

export interface SpriteRendererOptions extends RendererOptions {
  fps: DynamicValue<number>;
  tileSize: {x: number, y: number};
  tileMargin: {x: number, y: number};
  gridSize: {x: number, y: number};
  frames: number;
  randomStartFrame: boolean;
  alphaMap: string | THREE.Texture;
  material: 'unlit' | 'basic';
  materialOptions: BasicSpriteOptions | UnlitSpriteOptions;
  castShadow: boolean;
  softParticleDistance: number;
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

  randomStartFrame: boolean = false;

  castShadow: boolean = false;

  softParticleDistance: number = 0;

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
    super(options);

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
    this.castShadow = options.castShadow ?? this.castShadow;
    this.softParticleDistance = options.softParticleDistance
      ?? options.materialOptions?.softParticleDistance
      ?? 0;

    this.frames = options.frames ?? this.gridSize.x * this.gridSize.y;
    this.randomStartFrame = options.randomStartFrame ?? false;

    this.geometry = new THREE.BufferGeometry();

    // Set material options and load material
    this._materialOptions = options.materialOptions;
    this.material = this.loadMaterial(this._materialOptions);
    this.points = new THREE.Points(this.geometry, this.material);
    this.points.frustumCulled = false;
    this.points.castShadow = this.castShadow;

    // Add user data to the points so we can recognize it elsewhere
    this.points.userData[SPRITE_RENDERER_USER_DATA_KEY] = true;
  }

  setup(system: ParticleSystem) {
    system.add(this.points);
  }

  _update(particles: Particle[], system: ParticleSystem): void {
    // Update attributes
    this.updateAttributes(particles);

    // Should the points cast a shadow?
    this.points.castShadow = this.castShadow;

    // Set uniforms for soft particles
    this.setUniformValue('softParticles', Boolean(this.softParticleDistance));
    this.setUniformValue('softParticleDistance', this.softParticleDistance);

    // Get depth texture for soft particles
    if (!(system.sceneRenderer instanceof THREE.WebGLRenderer)) return;
    if (!(system.scene instanceof THREE.Scene)) return;
    if (!(system.sceneCamera instanceof THREE.Camera)) return;

    const depthTexture = this.getSceneDepth(system.sceneRenderer, system.scene, system.sceneCamera);
    const cameraNear = 'near' in system.sceneCamera ? system.sceneCamera.near : undefined;
    const cameraFar = 'far' in system.sceneCamera ? system.sceneCamera.far : undefined;
    const softParticles = this.softParticleDistance > 0
      && Boolean(depthTexture)
      && typeof cameraNear === 'number'
      && typeof cameraFar === 'number';

    if (softParticles && depthTexture) {
      this.setUniformValue('softParticles', true);
      this.setUniformValue('sceneDepthTexture', depthTexture);

      const depthResolution = this.getUniformValue<THREE.Vector2>(
        'depthResolution',
        () => new THREE.Vector2(),
      );
      system.sceneRenderer.getDrawingBufferSize(depthResolution);

      this.setUniformValue('depthCameraNear', cameraNear);
      this.setUniformValue('depthCameraFar', cameraFar);
    } else {
      this.setUniformValue('softParticles', false);
    }

    const environment =
        this._materialOptions && 'envMap' in this._materialOptions
            ? this._materialOptions.envMap ?? system.scene.environment
            : system.scene.environment;

    // Update environment map
    this.updateEnvironmentMap(system.sceneRenderer, environment);
  }

  private updateAttributes(particles: Particle[]) {
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
          (particle: Particle) => (
            this.randomStartFrame
              ? Math.floor(seedrandom(particle.id).quick() * this.frames)
              : 0
          ) + (
            Math.floor(
              particle.realtime * evaluateDynamicNumber(this.fps, particle.time, particle.id),
            ) % this.frames
          ),
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
      softParticleDistance: this.softParticleDistance
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

  private setUniformValue<T>(name: string, value: T): void {
    this.material.uniforms[name] ??= { value };
    this.material.uniforms[name].value = value;
  }

  private getUniformValue<T>(name: string, create: () => T): T {
    this.material.uniforms[name] ??= { value: create() };
    return this.material.uniforms[name].value as T;
  }

  private getSceneDepth(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.Camera,
  ): THREE.DepthTexture | undefined {
    let data = scene.userData[SCENE_DEPTH_DATA_USER_DATA_KEY] as SceneDepthData | undefined;

    if (!data) {
      const size = renderer.getDrawingBufferSize(new THREE.Vector2());

      const depthTexture = new THREE.DepthTexture(
        size.x,
        size.y,
        THREE.UnsignedIntType,
      );

      const target = new THREE.WebGLRenderTarget(
        size.x,
        size.y,
        {
          depthBuffer: true,
          depthTexture,
        },
      );

      const material = new THREE.MeshDepthMaterial({
        depthPacking: THREE.BasicDepthPacking,
      });
      material.colorWrite = false;

      data = {
        target,
        material,
        frame: -1,
        rendering: false,
      };

      scene.userData[SCENE_DEPTH_DATA_USER_DATA_KEY] = data;
    }

    if (data.rendering) {
      return data.target.depthTexture ?? undefined;
    }

    const frame = renderer.info.render.frame;

    if (data.frame === frame) {
      return data.target.depthTexture ?? undefined;
    }

    data.frame = frame;
    data.rendering = true;

    const size = renderer.getDrawingBufferSize(
      new THREE.Vector2(),
    );

    if (
      data.target.width !== size.x
      || data.target.height !== size.y
    ) {
      data.target.setSize(
        size.x,
        size.y,
      );
    }

    const previousTarget = renderer.getRenderTarget();
    const previousOverrideMaterial = scene.overrideMaterial;
    const hiddenSpriteRenderers = this.hideSpriteRenderers(scene);

    try {
      scene.overrideMaterial = data.material;

      renderer.setRenderTarget(data.target);
      renderer.clear();

      renderer.render(scene, camera);

      data.frame = renderer.info.render.frame;
    } finally {
      renderer.setRenderTarget(previousTarget);
      scene.overrideMaterial = previousOverrideMaterial;
      this.restoreSpriteRenderers(hiddenSpriteRenderers);
      data.rendering = false;
    }

    return data.target.depthTexture ?? undefined;
  }

  private hideSpriteRenderers(scene: THREE.Scene): HiddenSpriteRenderer[] {
    const hidden: HiddenSpriteRenderer[] = [];

    scene.traverse((object) => {
      if (!object.userData[SPRITE_RENDERER_USER_DATA_KEY]) return;

      hidden.push({
        object,
        visible: object.visible,
      });

      object.visible = false;
    });

    return hidden;
  }

  private restoreSpriteRenderers(hidden: HiddenSpriteRenderer[]): void {
    hidden.forEach(({ object, visible }) => {
      object.visible = visible;
    });
  }
}

export default SpriteRenderer;
