"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function typeGuard(o) {
    function exclusive(arg) {
        return true;
    }
    try {
        return exclusive(o);
    }
    catch (_a) {
        return false;
    }
}
exports.default = typeGuard;
