import * as THREE from 'three';
import { Renderer } from '../Renderer';
import simple from '../assets/images/default.png';
import UnlitSprite from '../materials/UnlitSprite';
import BasicSprite from '../materials/BasicSprite';
import evaluateDynamicNumber from '../helpers/evaluateDynamicNumber';
class SpriteRenderer extends Renderer {
    get materialOptions() { return this._materialOptions; }
    set materialOptions(value) {
        this._materialOptions = value;
        this.material = this.loadMaterial(value);
        this.points.material = this.material;
    }
    constructor(texture = simple, options = {}) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
        super();
        this.frames = 1;
        this.materialType = 'unlit';
        this.tileSize = new THREE.Vector2(0, 0);
        this.tileMargin = new THREE.Vector2(0, 0);
        this.gridSize = new THREE.Vector2(1, 1);
        this.fps = 1;
        this.castShadow = false;
        this.softParticleDistance = 0;
        const textureLoader = new THREE.TextureLoader();
        this.texture = typeof texture === 'string' ? textureLoader.load(texture, (tex) => {
            if (!options.tileSize) {
                this.tileSize = new THREE.Vector2(tex.image.naturalWidth / this.gridSize.x, tex.image.naturalHeight / this.gridSize.y);
            }
        }) : texture;
        this.fps = (_a = options.fps) !== null && _a !== void 0 ? _a : 1;
        this.alphaMap = typeof options.alphaMap === 'string'
            ? textureLoader.load(options.alphaMap)
            : options.alphaMap;
        this.materialType = (_b = options.material) !== null && _b !== void 0 ? _b : this.materialType;
        this.tileSize = new THREE.Vector2((_c = options.tileSize) === null || _c === void 0 ? void 0 : _c.x, (_d = options.tileSize) === null || _d === void 0 ? void 0 : _d.y);
        this.tileMargin = new THREE.Vector2((_e = options.tileMargin) === null || _e === void 0 ? void 0 : _e.x, (_f = options.tileMargin) === null || _f === void 0 ? void 0 : _f.y);
        this.gridSize = new THREE.Vector2((_h = (_g = options.gridSize) === null || _g === void 0 ? void 0 : _g.x) !== null && _h !== void 0 ? _h : 1, (_k = (_j = options.gridSize) === null || _j === void 0 ? void 0 : _j.y) !== null && _k !== void 0 ? _k : 1);
        this.castShadow = (_l = options.castShadow) !== null && _l !== void 0 ? _l : this.castShadow;
        this.softParticleDistance = (_p = (_m = options.softParticleDistance) !== null && _m !== void 0 ? _m : (_o = options.materialOptions) === null || _o === void 0 ? void 0 : _o.softParticleDistance) !== null && _p !== void 0 ? _p : 0;
        this.frames = (_q = options.frames) !== null && _q !== void 0 ? _q : this.gridSize.x * this.gridSize.y;
        this.geometry = new THREE.BufferGeometry();
        // Set material options and load material
        this._materialOptions = options.materialOptions;
        this.material = this.loadMaterial(this._materialOptions);
        this.points = new THREE.Points(this.geometry, this.material);
        this.points.frustumCulled = false;
        this.points.castShadow = this.castShadow;
        // Add user data to the points so we can recognize it elsewhere
        this.points.userData["__rmps_spriteRenderer"] = true;
    }
    setup(system) {
        system.add(this.points);
    }
    update(particles, system) {
        var _a;
        // Update attributes
        this.updateAttributes(particles);
        // Should the points cast a shadow?
        this.points.castShadow = this.castShadow;
        // Set uniforms for soft particles
        this.material.uniforms.softParticles.value = Boolean(this.softParticleDistance);
        this.material.uniforms.softParticleDistance.value = this.softParticleDistance;
        // Get depth texture for soft particles
        if (!(system.sceneRenderer instanceof THREE.WebGLRenderer))
            return;
        if (!(system.scene instanceof THREE.Scene))
            return;
        if (!(system.sceneCamera instanceof THREE.Camera))
            return;
        const depthTexture = this.getSceneDepth(system.sceneRenderer, system.scene, system.sceneCamera);
        const softParticles = this.softParticleDistance > 0 && Boolean(depthTexture);
        this.material.uniforms.softParticles.value = softParticles;
        if (softParticles && depthTexture) {
            this.material.uniforms.softParticles = { value: true };
            this.material.uniforms.sceneDepthTexture = { value: depthTexture };
            this.material.uniforms.depthResolution = { value: new THREE.Vector2() };
            system.sceneRenderer.getDrawingBufferSize(this.material.uniforms.depthResolution.value);
            if (system.sceneCamera instanceof THREE.PerspectiveCamera) {
                this.material.uniforms.depthCameraNear = { value: system.sceneCamera.near };
                this.material.uniforms.depthCameraFar = { value: system.sceneCamera.far };
            }
        }
        else {
            this.material.uniforms.softParticles = { value: false };
        }
        const environment = this._materialOptions && 'envMap' in this._materialOptions
            ? (_a = this._materialOptions.envMap) !== null && _a !== void 0 ? _a : system.scene.environment
            : system.scene.environment;
        // Update environment map
        this.updateEnvironmentMap(system.sceneRenderer, environment);
    }
    updateAttributes(particles) {
        this.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(particles.flatMap((particle) => particle.position.toArray())), 3));
        this.geometry.setAttribute('scale', new THREE.BufferAttribute(new Float32Array(particles.flatMap((particle) => particle.scale.toArray())), 3));
        this.geometry.setAttribute('rotation', new THREE.BufferAttribute(new Float32Array(particles.flatMap((particle) => particle.rotation.toArray())), 3));
        this.geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(particles.flatMap((particle) => particle.color.toArray().concat(particle.alpha))), 4));
        this.geometry.setAttribute('frame', new THREE.BufferAttribute(new Float32Array(particles.flatMap((particle) => Math.floor(particle.realtime * evaluateDynamicNumber(this.fps, particle.time, particle.id)) % this.frames)), 1));
    }
    destroy() {
        var _a;
        (_a = this.environmentRenderTarget) === null || _a === void 0 ? void 0 : _a.dispose();
        this.environmentRenderTarget = undefined;
        this.points.removeFromParent();
    }
    loadMaterial(options) {
        const createMaterial = this.materialType === 'basic' ? BasicSprite : UnlitSprite;
        return createMaterial(this.texture, Object.assign(Object.assign({}, (options !== null && options !== void 0 ? options : {})), { frames: this.frames, gridSize: this.gridSize, alphaMap: this.alphaMap, softParticleDistance: this.softParticleDistance }));
    }
    updateEnvironmentMap(renderer, environment) {
        var _a;
        if (this.materialType !== 'basic')
            return;
        if (environment === this.environmentSource
            && renderer === this.environmentRenderer) {
            return;
        }
        (_a = this.environmentRenderTarget) === null || _a === void 0 ? void 0 : _a.dispose();
        this.environmentRenderTarget = undefined;
        this.environmentSource = environment !== null && environment !== void 0 ? environment : undefined;
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
        const pmremGenerator = new THREE.PMREMGenerator(renderer);
        let renderTarget;
        if (environment.isCubeTexture) {
            renderTarget =
                pmremGenerator.fromCubemap(environment);
        }
        else {
            renderTarget =
                pmremGenerator.fromEquirectangular(environment);
        }
        pmremGenerator.dispose();
        this.environmentRenderTarget = renderTarget;
        this.setEnvironmentMap(renderTarget.texture);
    }
    setEnvironmentMap(environment) {
        var _a, _b, _c, _d, _e;
        var _f;
        if (this.materialType !== 'basic')
            return;
        this.material.uniforms.envMap.value = environment;
        this.material.uniforms.hasEnvMap.value = environment !== null;
        if (!environment) {
            (_a = this.material.defines) === null || _a === void 0 ? true : delete _a.ENVMAP_TYPE_CUBE_UV;
            (_b = this.material.defines) === null || _b === void 0 ? true : delete _b.CUBEUV_TEXEL_WIDTH;
            (_c = this.material.defines) === null || _c === void 0 ? true : delete _c.CUBEUV_TEXEL_HEIGHT;
            (_d = this.material.defines) === null || _d === void 0 ? true : delete _d.CUBEUV_MAX_MIP;
            this.material.needsUpdate = true;
            return;
        }
        const image = environment.source.data;
        const imageHeight = image.height;
        const maxMip = Math.log2(imageHeight) - 2;
        const texelHeight = 1 / imageHeight;
        const texelWidth = 1 / (3 * Math.max(Math.pow(2, maxMip), 7 * 16));
        (_e = (_f = this.material).defines) !== null && _e !== void 0 ? _e : (_f.defines = {});
        this.material.defines.ENVMAP_TYPE_CUBE_UV = '';
        this.material.defines.CUBEUV_TEXEL_WIDTH = `${texelWidth}`;
        this.material.defines.CUBEUV_TEXEL_HEIGHT = `${texelHeight}`;
        this.material.defines.CUBEUV_MAX_MIP = `${maxMip}.0`;
        this.material.needsUpdate = true;
    }
    getSceneDepth(renderer, scene, camera) {
        var _a, _b, _c;
        let data = scene.userData["__rmps_sceneDepthData"];
        if (!data) {
            const size = renderer.getDrawingBufferSize(new THREE.Vector2());
            const depthTexture = new THREE.DepthTexture(size.x, size.y, THREE.UnsignedIntType);
            const target = new THREE.WebGLRenderTarget(size.x, size.y, {
                depthBuffer: true,
                depthTexture,
            });
            data = {
                target,
                frame: -1,
                rendering: false,
            };
            scene.userData["__rmps_sceneDepthData"] = data;
        }
        if (data.rendering) {
            return (_a = data.target.depthTexture) !== null && _a !== void 0 ? _a : undefined;
        }
        const frame = renderer.info.render.frame;
        if (data.frame === frame) {
            return (_b = data.target.depthTexture) !== null && _b !== void 0 ? _b : undefined;
        }
        data.frame = frame;
        data.rendering = true;
        const size = renderer.getDrawingBufferSize(new THREE.Vector2());
        if (data.target.width !== size.x
            || data.target.height !== size.y) {
            data.target.setSize(size.x, size.y);
        }
        const previousTarget = renderer.getRenderTarget();
        renderer.setRenderTarget(data.target);
        renderer.clear();
        renderer.render(scene, camera);
        renderer.setRenderTarget(previousTarget);
        data.rendering = false;
        return (_c = data.target.depthTexture) !== null && _c !== void 0 ? _c : undefined;
    }
}
export default SpriteRenderer;
