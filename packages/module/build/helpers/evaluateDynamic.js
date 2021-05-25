"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const curves_1 = require("curves");
function evaluateDynamic(value, 
// eslint-disable-next-line no-unused-vars
interpolate, time = 0) {
    if (value instanceof curves_1.default) {
        return value.evaluate(time);
    }
    if ('min' in value && 'max' in value) {
        const min = evaluateDynamic(value.min, interpolate, time);
        const max = evaluateDynamic(value.max, interpolate, time);
        return interpolate(min, max, Math.random());
    }
    return value;
}
exports.default = evaluateDynamic;
