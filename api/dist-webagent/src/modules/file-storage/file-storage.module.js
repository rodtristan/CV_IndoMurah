"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileStorageModule = void 0;
const common_1 = require("@nestjs/common");
const file_storage_controller_1 = require("./file-storage.controller");
const gdrive_service_1 = require("./gdrive.service");
let FileStorageModule = class FileStorageModule {
};
exports.FileStorageModule = FileStorageModule;
exports.FileStorageModule = FileStorageModule = __decorate([
    (0, common_1.Module)({ controllers: [file_storage_controller_1.FileStorageController], providers: [gdrive_service_1.GDriveService], exports: [gdrive_service_1.GDriveService] })
], FileStorageModule);
