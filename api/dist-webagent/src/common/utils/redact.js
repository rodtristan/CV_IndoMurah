"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSensitiveKey = isSensitiveKey;
exports.redactDeep = redactDeep;
const EXACT_KEYS = new Set([
    'password',
    'passwordhash',
    'newpassword',
    'currentpassword',
    'oldpassword',
    'passwordconfirmation',
    'confirmpassword',
    'token',
    'accesstoken',
    'refreshtoken',
    'authorization',
    'secret',
    'clientsecret',
    'apikey',
    'pin',
    'otp',
]);
const SUBSTRINGS = ['password', 'token', 'secret', 'apikey'];
function isSensitiveKey(key) {
    const k = String(key).toLowerCase().replace(/[_\-\s]/g, '');
    if (EXACT_KEYS.has(k))
        return true;
    return SUBSTRINGS.some((s) => k.includes(s));
}
const MAX_DEPTH = 8;
function redactDeep(value, depth = 0) {
    if (value === null || value === undefined)
        return value;
    if (typeof value !== 'object')
        return value;
    if (depth > MAX_DEPTH)
        return '[TRUNCATED]';
    if (value instanceof Date)
        return value;
    if (Array.isArray(value)) {
        return value.map((v) => redactDeep(v, depth + 1));
    }
    const out = {};
    for (const [k, v] of Object.entries(value)) {
        out[k] = isSensitiveKey(k) ? '[REDACTED]' : redactDeep(v, depth + 1);
    }
    return out;
}
