"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const THREE = require("three");
const evaluateDynamic_1 = require("./evaluateDynamic");
function evaluateDynamicVector(value = new THREE.Vector3(), time = 0) {
    return evaluateDynamic_1.default(value, (a, b, t) => (a.clone().add((b.clone().sub(a).multiplyScalar(t)))), time);
}
exports.default = evaluateDynamicVector;
