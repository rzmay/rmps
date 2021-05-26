"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const THREE = require("three");
const UnlitSprite_vert_1 = require("../shaders/UnlitSprite.vert");
const UnlitSprite_frag_1 = require("../shaders/UnlitSprite.frag");
const loader = new THREE.FileLoader();
const vert = loader.loadAsync(UnlitSprite_vert_1.default);
const frag = loader.loadAsync(UnlitSprite_frag_1.default);
const UnlitSprite = (texture, props) => __awaiter(void 0, void 0, void 0, function* () {
    return new THREE.ShaderMaterial(Object.assign({ vertexShader: yield vert, fragmentShader: yield frag, uniforms: {
            pointTexture: { value: texture },
        }, depthTest: true, depthWrite: false, transparent: true, vertexColors: true }, props));
});
exports.default = UnlitSprite;
