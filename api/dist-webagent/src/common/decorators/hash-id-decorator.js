"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HashId = void 0;
const common_1 = require("@nestjs/common");
const hashids_1 = __importDefault(require("hashids"));
const defaultSalt = process.env.HASH_ID_SALT || 'toko-cv-indomurah-default-salt';
const defaultMinLen = parseInt(process.env.HASH_ID_MIN_LENGTH || '8', 10);
const hashids = new hashids_1.default(defaultSalt, defaultMinLen);
exports.HashId = (0, common_1.createParamDecorator)((paramName = 'id', ctx) => {
    const req = ctx.switchToHttp().getRequest();
    const raw = req.params?.[paramName];
    if (!raw) {
        throw new common_1.BadRequestException(`Missing route parameter: ${paramName}`);
    }
    const decoded = hashids.decode(raw);
    if (!decoded.length) {
        throw new common_1.BadRequestException(`Invalid ID format for parameter: ${paramName}`);
    }
    return decoded[0];
});
