"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.number = number;
function number(value) {
    if (value === null || value === undefined) {
        return 0;
    }
    if (typeof value === 'number') {
        return value;
    }
    if (typeof value === 'string') {
        return parseFloat(value) || 0;
    }
    if (typeof value === 'object' && typeof value.toNumber === 'function') {
        return value.toNumber();
    }
    if (typeof value === 'object' && typeof value.toString === 'function') {
        return parseFloat(String(value)) || 0;
    }
    return Number(value) || 0;
}
