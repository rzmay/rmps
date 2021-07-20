"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const THREE = require("three");
const evaluateDynamic_1 = require("./evaluateDynamic");
function evaluateDynamicColor(value = new THREE.Color(), time = 0) {
    return evaluateDynamic_1.default(value, (a, b, t) => (a.clone().add((b.clone().sub(a).multiplyScalar(t)))), time);
}
exports.default = evaluateDynamicColor;
