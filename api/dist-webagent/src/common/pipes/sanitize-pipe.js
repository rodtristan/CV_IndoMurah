"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SanitizePipe = void 0;
const common_1 = require("@nestjs/common");
let SanitizePipe = class SanitizePipe {
    transform(value, _metadata) {
        return this.sanitize(value);
    }
    sanitize(value) {
        if (typeof value === 'string') {
            return this.cleanString(value);
        }
        if (Array.isArray(value)) {
            return value.map((item) => this.sanitize(item));
        }
        if (value !== null && typeof value === 'object') {
            const result = {};
            for (const [key, val] of Object.entries(value)) {
                result[key] = this.isPasswordField(key) ? val : this.sanitize(val);
            }
            return result;
        }
        return value;
    }
    isPasswordField(key) {
        return /password/i.test(key);
    }
    cleanString(str) {
        let clean = str
            .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
            .replace(/<[^>]+on\w+="[^"]*"/gi, '')
            .replace(/<[^>]+on\w+='[^']*'/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/vbscript:/gi, '')
            .replace(/data:/gi, '')
            .replace(/;\s*(DROP|ALTER|CREATE|TRUNCATE|INSERT|UPDATE|DELETE)\s/gi, '')
            .replace(/--/g, '')
            .replace(/\/\*/g, '')
            .replace(/\*\//g, '');
        if (clean.length > 10000) {
            throw new common_1.BadRequestException('Input terlalu panjang. Maksimal 10.000 karakter per field.');
        }
        return clean.trim();
    }
};
exports.SanitizePipe = SanitizePipe;
exports.SanitizePipe = SanitizePipe = __decorate([
    (0, common_1.Injectable)()
], SanitizePipe);
