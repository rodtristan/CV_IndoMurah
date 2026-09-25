"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveJwtSecret = resolveJwtSecret;
const config_1 = require("@nestjs/config");
const DEV_FALLBACK_SECRET = 'dev-only-insecure-jwt-secret-change-me-0123456789';
const MIN_SECRET_LENGTH = 32;
function resolveJwtSecret(env = process.env) {
    const secret = (env.JWT_SECRET ?? '').trim();
    if (env.NODE_ENV === 'production') {
        if (secret.length < MIN_SECRET_LENGTH) {
            throw new Error(`JWT_SECRET wajib diisi (minimal ${MIN_SECRET_LENGTH} karakter) saat NODE_ENV=production. ` +
                'Buat dengan: node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"');
        }
        return secret;
    }
    return secret || DEV_FALLBACK_SECRET;
}
exports.default = (0, config_1.registerAs)('jwt', () => ({
    secret: resolveJwtSecret(),
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
    authSecretKey: process.env.AUTH_SECRET_KEY || '',
}));
