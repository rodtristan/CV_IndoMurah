"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenuKey = exports.MENU_KEY_METADATA = void 0;
const common_1 = require("@nestjs/common");
exports.MENU_KEY_METADATA = 'menu_key';
const MenuKey = (key) => (0, common_1.SetMetadata)(exports.MENU_KEY_METADATA, key);
exports.MenuKey = MenuKey;
