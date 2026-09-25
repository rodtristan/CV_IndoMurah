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
exports.AdminRouteGuard = void 0;
exports.resolveRouteRule = resolveRouteRule;
const common_1 = require("@nestjs/common");
const authz_service_1 = require("../auth/authz-service");
const jwt_auth_guard_1 = require("./jwt-auth-guard");
const API_PREFIX = '/api/v1/';
const ADMIN_ALL = [
    'auth/register',
    'users',
    'roles',
    'user-role',
    'role-menu',
    'user-menu',
    'menus',
    'backup',
    'log',
    'activity-log',
    'accounting',
    'business-logic/accounting',
    'business-logic/journal',
    'journal',
    'journal-entry',
    'opening-balance',
    'fiscal-year',
    'import',
    'product-import',
    'stock-balance',
    'attendance-admin',
    'testing',
];
const ADMIN_WRITE = [
    'company',
    'app-setting',
    'general-settings',
    'numbering',
    'account-setting',
    'notification-setting',
];
const OPEN_EXCEPTIONS = [
    { method: 'GET', path: /^menus\/my-menus$/ },
    { method: 'GET', path: /^menus\/check\/[^/]+$/ },
];
function matchesPrefix(path, prefixes) {
    return prefixes.some((p) => path === p || path.startsWith(p + '/'));
}
function resolveRouteRule(method, path) {
    const m = method.toUpperCase();
    if (OPEN_EXCEPTIONS.some((e) => e.method === m && e.path.test(path)))
        return 'none';
    if (matchesPrefix(path, ADMIN_ALL))
        return 'admin';
    if (matchesPrefix(path, ADMIN_WRITE) && m !== 'GET' && m !== 'HEAD')
        return 'admin';
    return 'none';
}
function normalizePath(raw) {
    let p = String(raw || '').split('?')[0];
    try {
        p = decodeURIComponent(p);
    }
    catch {
    }
    p = p.toLowerCase().replace(/\/{2,}/g, '/');
    if (p.startsWith(API_PREFIX))
        p = p.slice(API_PREFIX.length);
    else if (p.startsWith('/'))
        p = p.slice(1);
    return p.replace(/\/+$/, '');
}
let AdminRouteGuard = class AdminRouteGuard {
    constructor(authz) {
        this.authz = authz;
        this.logger = new common_1.Logger('AdminRouteGuard');
        this.jwtGuard = new jwt_auth_guard_1.JwtAuthGuard();
    }
    async canActivate(context) {
        if (context.getType() !== 'http')
            return true;
        const req = context.switchToHttp().getRequest();
        const routePattern = req.routeOptions?.url ?? req.routerPath;
        const path = normalizePath(routePattern ?? req.url ?? '');
        const rawPath = normalizePath(req.url ?? '');
        const method = String(req.method ?? 'GET');
        const rule = resolveRouteRule(method, path) === 'admin' || resolveRouteRule(method, rawPath) === 'admin' ? 'admin' : 'none';
        if (rule === 'none')
            return true;
        await this.jwtGuard.canActivate(context);
        const user = req.user;
        try {
            if (!user?.id)
                throw new common_1.ForbiddenException('Akses ditolak');
            const access = await this.authz.getAccess(user.id);
            if (!access.exists || !access.isActive || !access.isAdmin) {
                throw new common_1.ForbiddenException('Akses ditolak: hanya Administrator yang boleh mengakses fitur ini');
            }
            return true;
        }
        catch (err) {
            if (err instanceof common_1.HttpException)
                throw err;
            this.logger.error(`Gagal memeriksa hak akses (${method} ${path}): ${err?.message}`);
            throw new common_1.ForbiddenException('Akses ditolak');
        }
    }
};
exports.AdminRouteGuard = AdminRouteGuard;
exports.AdminRouteGuard = AdminRouteGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [authz_service_1.AuthzService])
], AdminRouteGuard);
