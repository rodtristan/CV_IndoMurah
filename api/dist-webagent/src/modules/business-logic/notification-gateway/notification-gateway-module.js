"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationGatewayModule = void 0;
const common_1 = require("@nestjs/common");
const notification_gateway_controller_1 = require("./notification-gateway-controller");
const notification_gateway_service_1 = require("./notification-gateway-service");
let NotificationGatewayModule = class NotificationGatewayModule {
};
exports.NotificationGatewayModule = NotificationGatewayModule;
exports.NotificationGatewayModule = NotificationGatewayModule = __decorate([
    (0, common_1.Module)({
        controllers: [notification_gateway_controller_1.NotificationGatewayController],
        providers: [notification_gateway_service_1.NotificationGatewayService],
        exports: [notification_gateway_service_1.NotificationGatewayService],
    })
], NotificationGatewayModule);
