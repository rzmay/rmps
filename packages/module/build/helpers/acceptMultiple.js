"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.acceptMultiple = void 0;
function acceptMultiple(param) {
    const arr = [];
    return arr.concat(param).filter((e) => e != null);
}
exports.acceptMultiple = acceptMultiple;
