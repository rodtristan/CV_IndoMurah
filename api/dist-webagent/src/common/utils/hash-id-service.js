"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HashIdService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const hashids_1 = __importDefault(require("hashids"));
let HashIdService = class HashIdService {
    constructor(config) {
        this.config = config;
        const salt = config.get('security.hashIdSalt', 'toko-cv-indomurah-default-salt');
        const minLength = config.get('security.hashIdMinLength', 8);
        this.hashids = new hashids_1.default(salt, minLength);
    }
    encode(id) {
        return this.hashids.encode(id);
    }
    decode(hash) {
        const decoded = this.hashids.decode(hash);
        if (!decoded.length) {
            throw new common_1.BadRequestException(`ID tidak valid: "${hash}". Format ID tidak dikenali.`);
        }
        return decoded[0];
    }
    encodeMany(ids) {
        return ids.map((id) => this.encode(id));
    }
    decodeMany(hashes) {
        return hashes.map((h) => this.decode(h));
    }
};
exports.HashIdService = HashIdService;
exports.HashIdService = HashIdService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], HashIdService);
