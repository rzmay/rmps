var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import * as THREE from 'three';
import unlitSpriteVert from '../shaders/UnlitSprite.vert.js';
import unlitSpriteFrag from '../shaders/UnlitSprite.frag.js';
const UnlitSprite = (texture, options = {}) => {
    const { gridSize, frames, alphaMap, softParticles, softParticleDistance = 0 } = options, materialOptions = __rest(options, ["gridSize", "frames", "alphaMap", "softParticles", "softParticleDistance"]);
    return new THREE.ShaderMaterial(Object.assign({ vertexShader: unlitSpriteVert, fragmentShader: unlitSpriteFrag, uniforms: {
            pointTexture: { value: texture },
            gridSize: { value: gridSize !== null && gridSize !== void 0 ? gridSize : { x: 1, y: 1 } },
            n_frames: { value: frames !== null && frames !== void 0 ? frames : 1 },
            alphaMap: { value: alphaMap !== null && alphaMap !== void 0 ? alphaMap : null },
            hasAlphaMap: { value: Boolean(alphaMap) },
            softParticles: { value: Boolean(softParticleDistance) },
            softParticleDistance: { value: softParticleDistance },
            sceneDepthTexture: { value: null },
            depthResolution: { value: new THREE.Vector2() },
            depthCameraNear: { value: 0.1 },
            depthCameraFar: { value: 2000 },
        }, depthTest: true, depthWrite: false, transparent: true, vertexColors: true }, materialOptions));
};
export default UnlitSprite;
