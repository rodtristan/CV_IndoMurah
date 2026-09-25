"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('app', () => {
    const rawOrigin = process.env.CORS_ORIGIN || '';
    const corsOrigin = rawOrigin
        ? rawOrigin.split(',').map((o) => o.trim()).filter(Boolean)
        : '*';
    return {
        env: process.env.NODE_ENV || 'development',
        host: process.env.NODE_HOST || '0.0.0.0',
        port: parseInt(process.env.PORT || '5000', 10),
        corsOrigin,
    };
});
