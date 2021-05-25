"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const evaluateDynamic_1 = require("./evaluateDynamic");
function evaluateDynamicColor(value, time = 0) {
    return evaluateDynamic_1.default(value, (a, b, t) => (a.add((b.sub(a).multiplyScalar(t)))), time);
}
exports.default = evaluateDynamicColor;
