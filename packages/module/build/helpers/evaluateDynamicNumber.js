"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const evaluateDynamic_1 = require("./evaluateDynamic");
function evaluateDynamicNumber(value, time = 0) {
    return evaluateDynamic_1.default(value, (a, b, t) => (a + (b - a) * t), time);
}
exports.default = evaluateDynamicNumber;
