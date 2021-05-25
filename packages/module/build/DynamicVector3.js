"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const THREE = require("three");
const DynamicValue_1 = require("./abstract/DynamicValue");
class DynamicVector3 extends DynamicValue_1.default {
    evaluateBetween(time) {
        const value = this.value;
        const from = value.from.evaluate(time);
        const to = value.to.evaluate(time);
        const rand = Math.random();
        return new THREE.Vector3(from.x + (to.x - from.x) * rand, from.y + (to.y - from.y) * rand, from.z + (to.z - from.z) * rand);
    }
}
exports.default = DynamicVector3;
