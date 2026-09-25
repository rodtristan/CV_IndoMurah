"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaginationMeta = exports.ApiResponse = void 0;
class ApiResponse {
    static ok(data, message) {
        return {
            success: true,
            data,
            message,
        };
    }
    static paginated(data, total, skip, take, message) {
        return {
            success: true,
            data,
            message,
            meta: {
                total,
                skip,
                take,
                pages: Math.ceil(total / take),
                hasNext: skip + take < total,
                hasPrev: skip > 0,
            },
        };
    }
    static error(message) {
        return {
            success: false,
            message,
        };
    }
}
exports.ApiResponse = ApiResponse;
class PaginationMeta {
}
exports.PaginationMeta = PaginationMeta;
