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
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        super();
        this.frames = 1;
        this.materialType = 'unlit';
        this.tileSize = new THREE.Vector2(0, 0);
        this.tileMargin = new THREE.Vector2(0, 0);
        this.gridSize = new THREE.Vector2(1, 1);
        this.fps = 1;
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
        this.frames = (_l = options.frames) !== null && _l !== void 0 ? _l : this.gridSize.x * this.gridSize.y;
        this.geometry = new THREE.BufferGeometry();
        // Set material options and load material
        this._materialOptions = options.materialOptions;
        this.material = this.loadMaterial(this._materialOptions);
        this.points = new THREE.Points(this.geometry, this.material);
        this.points.frustumCulled = false;
        // Get a reference to the renderer
        this.points.onBeforeRender = (renderer, scene) => {
            var _a;
            if (!(renderer instanceof THREE.WebGLRenderer))
                return;
            const environment = this._materialOptions && 'envMap' in this._materialOptions
                ? (_a = this._materialOptions.envMap) !== null && _a !== void 0 ? _a : scene.environment
                : scene.environment;
            this.updateEnvironmentMap(renderer, environment);
        };
    }
    setup(system) {
        system.add(this.points);
        this.system = system;
    }
    update(particles) {
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
        return createMaterial(this.texture, Object.assign(Object.assign({}, (options !== null && options !== void 0 ? options : {})), { frames: this.frames, gridSize: this.gridSize, alphaMap: this.alphaMap }));
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
}
export default SpriteRenderer;
