"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DynamicValue_1 = require("./abstract/DynamicValue");
class DynamicNumber extends DynamicValue_1.default {
    evaluateBetween(time) {
        const value = this.value;
        const from = value.from.evaluate(time);
        const to = value.to.evaluate(time);
        return (from + (to - from) * Math.random());
    }
}
exports.default = DynamicNumber;
