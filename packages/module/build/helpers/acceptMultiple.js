"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function acceptMultiple(param) {
    const arr = [];
    return arr.concat(param).filter((e) => e != null);
}
exports.default = acceptMultiple;
