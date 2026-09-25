"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PathService = void 0;
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
class PathService {
    static uploadDir() {
        return path.join(this.ROOT, 'upload');
    }
    static photoDir() {
        return path.join(this.uploadDir(), 'photo');
    }
    static documentDir() {
        return path.join(this.uploadDir(), 'document');
    }
    static otherDir() {
        return path.join(this.uploadDir(), 'other');
    }
    static reportDir() {
        return path.join(this.uploadDir(), 'report');
    }
    static photoFile(filename) {
        return path.join(this.photoDir(), filename);
    }
    static documentFile(filename) {
        return path.join(this.documentDir(), filename);
    }
    static otherFile(filename) {
        return path.join(this.otherDir(), filename);
    }
    static reportFile(filename) {
        return path.join(this.reportDir(), filename);
    }
    static ensureDir(dirPath) {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    }
    static ensureAllDirs() {
        const dirs = [
            this.uploadDir(),
            this.photoDir(),
            this.documentDir(),
            this.otherDir(),
            this.reportDir(),
        ];
        dirs.forEach((dir) => this.ensureDir(dir));
    }
    static toPublicUrl(absolutePath) {
        return absolutePath.replace(this.ROOT, '').replace(/\\/g, '/');
    }
}
exports.PathService = PathService;
PathService.ROOT = path.resolve(process.cwd());
