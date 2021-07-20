"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function evaluateDynamic(value, interpolate, time = 0) {
    if (typeof value === 'function') {
        return value(time);
    }
    if (Object.keys(value).includes('dynamicRange') && 'min' in value && 'max' in value) {
        const min = evaluateDynamic(value.min, interpolate, time);
        const max = evaluateDynamic(value.max, interpolate, time);
        return interpolate(min, max, Math.random());
    }
    return value;
}
exports.default = evaluateDynamic;
