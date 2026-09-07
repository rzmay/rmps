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
import basicSpriteVert from '../shaders/BasicSprite.vert';
import basicSpriteFrag from '../shaders/BasicSprite.frag';
const BasicSprite = (texture, options = {}) => {
    const { gridSize, frames, alphaMap, normalMap, normalStrength = 1, normalLighting, sphericalNormals, roughness = 0.5, roughnessMap, envMap, envIntensity = 1.0, softParticles, softParticleDistance = 0 } = options, materialOptions = __rest(options, ["gridSize", "frames", "alphaMap", "normalMap", "normalStrength", "normalLighting", "sphericalNormals", "roughness", "roughnessMap", "envMap", "envIntensity", "softParticles", "softParticleDistance"]);
    return new THREE.ShaderMaterial(Object.assign({ vertexShader: basicSpriteVert, fragmentShader: basicSpriteFrag, uniforms: THREE.UniformsUtils.merge([
            THREE.UniformsLib.lights,
            {
                pointTexture: { value: texture },
                gridSize: { value: gridSize !== null && gridSize !== void 0 ? gridSize : { x: 1, y: 1 } },
                n_frames: { value: frames !== null && frames !== void 0 ? frames : 1 },
                alphaMap: { value: alphaMap !== null && alphaMap !== void 0 ? alphaMap : null },
                hasAlphaMap: { value: Boolean(alphaMap) },
                normalMap: { value: normalMap !== null && normalMap !== void 0 ? normalMap : null },
                hasNormalMap: { value: Boolean(normalMap) },
                normalStrength: { value: normalStrength },
                // Normal lighting, if not already set, defaults to 1 if there is a normal map present and 0 if not.
                normalLighting: { value: normalLighting !== null && normalLighting !== void 0 ? normalLighting : (normalMap ? 1 : 0) },
                sphericalNormals: { value: sphericalNormals !== null && sphericalNormals !== void 0 ? sphericalNormals : false },
                roughness: { value: roughness },
                roughnessMap: { value: roughnessMap !== null && roughnessMap !== void 0 ? roughnessMap : null },
                hasRoughnessMap: { value: Boolean(roughnessMap) },
                envMap: { value: envMap },
                envIntensity: { value: envIntensity },
                hasEnvMap: { value: Boolean(envMap) },
                softParticles: { value: Boolean(softParticleDistance) },
                softParticleDistance: { value: softParticleDistance },
                sceneDepthTexture: { value: null },
                depthResolution: { value: new THREE.Vector2() },
                depthCameraNear: { value: 0.1 },
                depthCameraFar: { value: 2000 },
            },
        ]), depthTest: true, depthWrite: false, lights: true, transparent: true, vertexColors: true }, materialOptions));
};
export default BasicSprite;
