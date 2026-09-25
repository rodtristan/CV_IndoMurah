"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const node_path_1 = __importDefault(require("node:path"));
const config_1 = require("prisma/config");
function buildDatabaseUrl() {
    const env = process.env.NODE_ENV || 'development';
    if (process.env.DATABASE_URL) {
        return process.env.DATABASE_URL;
    }
    if (env === 'production') {
        const { DB_PRD_USER, DB_PRD_PASS, DB_PRD_HOST, DB_PRD_PORT, DB_PRD } = process.env;
        return `postgresql://${DB_PRD_USER}:${DB_PRD_PASS}@${DB_PRD_HOST}:${DB_PRD_PORT}/${DB_PRD}?schema=public`;
    }
    if (env === 'testing') {
        const { DB_TEST_USER, DB_TEST_PASS, DB_TEST_HOST, DB_TEST_PORT, DB_TEST } = process.env;
        return `postgresql://${DB_TEST_USER}:${DB_TEST_PASS}@${DB_TEST_HOST}:${DB_TEST_PORT}/${DB_TEST}?schema=public`;
    }
    const { DB_DEV_USER, DB_DEV_PASS, DB_DEV_HOST, DB_DEV_PORT, DB_DEV } = process.env;
    return `postgresql://${DB_DEV_USER}:${DB_DEV_PASS}@${DB_DEV_HOST}:${DB_DEV_PORT}/${DB_DEV}?schema=public`;
}
exports.default = (0, config_1.defineConfig)({
    schema: node_path_1.default.join(__dirname, 'prisma', 'schema.prisma'),
    datasource: {
        url: buildDatabaseUrl(),
    },
    migrations: {
        seed: 'npx ts-node prisma/seed.ts',
    },
});
