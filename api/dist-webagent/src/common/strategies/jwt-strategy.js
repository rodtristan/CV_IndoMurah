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
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_jwt_1 = require("passport-jwt");
const jwt_config_1 = require("../../config/jwt-config");
const authz_service_1 = require("../auth/authz-service");
let JwtStrategy = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy) {
    constructor(authz) {
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: (0, jwt_config_1.resolveJwtSecret)(),
        });
        this.authz = authz;
    }
    async validate(payload) {
        if (!payload?.id || payload.typ === 'employee')
            throw new common_1.UnauthorizedException('Token tidak valid');
        const access = await this.authz.getAccess(payload.id);
        if (!access.exists || !access.isActive) {
            throw new common_1.UnauthorizedException('Akun tidak aktif. Silakan hubungi administrator.');
        }
        return {
            id: payload.id,
            companyId: payload.companyId,
            username: payload.username,
            roleId: payload.roleId,
        };
    }
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [authz_service_1.AuthzService])
], JwtStrategy);
