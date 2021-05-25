"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const THREE = require("three");
const DynamicValue_1 = require("./abstract/DynamicValue");
class DynamicColor extends DynamicValue_1.default {
    evaluateBetween(time) {
        const value = this.value;
        const from = value.from.evaluate(time);
        const to = value.to.evaluate(time);
        const rand = Math.random();
        return new THREE.Color(from.r + (to.r - from.r) * rand, from.g + (to.g - from.g) * rand, from.b + (to.b - from.b) * rand);
    }
}
exports.default = DynamicColor;
