"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('security', () => ({
    hashIdSalt: process.env.HASH_ID_SALT || 'toko-cv-indomurah-default-salt',
    hashIdMinLength: parseInt(process.env.HASH_ID_MIN_LENGTH || '8', 10),
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
    argon2MemoryCost: parseInt(process.env.ARGON2_MEMORY_COST || '65536', 10),
    argon2TimeCost: parseInt(process.env.ARGON2_TIME_COST || '3', 10),
    argon2Parallelism: parseInt(process.env.ARGON2_PARALLELISM || '4', 10),
}));
