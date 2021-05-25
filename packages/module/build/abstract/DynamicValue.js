"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const curves_1 = require("curves");
const DynamicValueType_1 = require("../enums/DynamicValueType");
const typeGuard_1 = require("../helpers/typeGuard");
class DynamicValue {
    constructor(value) {
        this.value = value;
        if (value instanceof curves_1.Curve) {
            this.type = DynamicValueType_1.default.Curve;
        }
        else if (typeGuard_1.default(value)) {
            this.type = DynamicValueType_1.default.Constant;
        }
        else {
            this.type = DynamicValueType_1.default.Between;
        }
    }
    evaluate(time = 0) {
        switch (this.type) {
            case DynamicValueType_1.default.Curve:
                return this.value.evaluate(time);
            case DynamicValueType_1.default.Between:
                return this.evaluateBetween(time);
            default:
                return this.value;
        }
    }
}
exports.default = DynamicValue;
