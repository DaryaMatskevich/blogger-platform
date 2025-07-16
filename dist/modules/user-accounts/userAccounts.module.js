"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserAccountsModule = void 0;
const common_1 = require("@nestjs/common");
const users_controller_1 = require("./api/users.controller");
const users_service_1 = require("./application/users.service");
const mongoose_1 = require("@nestjs/mongoose");
const user_entity_1 = require("./domain/dto/user.entity");
const users_repository_1 = require("./infastructure/users.repository");
const users_query_repository_1 = require("./infastructure/query/users.query-repository");
const users_external_query_repository_1 = require("./infastructure/external-query/external-dto/users.external-query-repository");
const jwt_strategy_1 = require("./guards/bearer/jwt.strategy");
const crypto_service_1 = require("./application/crypto.service");
const local_strategy_1 = require("./guards/local/local.strategy");
const auth_service_1 = require("./application/auth.service");
const auth_query_repository_1 = require("./infastructure/query/auth.query-repository");
const security_devices_query_repository_1 = require("./infastructure/query/security-devices.query-repository");
const email_service_1 = require("../notifications/email.service");
const jwt_1 = require("@nestjs/jwt");
const notifications_module_1 = require("../notifications/notifications.module");
let UserAccountsModule = class UserAccountsModule {
};
exports.UserAccountsModule = UserAccountsModule;
exports.UserAccountsModule = UserAccountsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            jwt_1.JwtModule.register({
                secret: 'access-token-secret',
                signOptions: { expiresIn: '60m' },
            }),
            mongoose_1.MongooseModule.forFeature([{ name: user_entity_1.User.name, schema: user_entity_1.UserSchema }]),
            notifications_module_1.NotificationsModule
        ],
        controllers: [users_controller_1.UsersController],
        providers: [
            users_service_1.UsersService,
            users_repository_1.UsersRepository,
            users_query_repository_1.UsersQueryRepository,
            users_external_query_repository_1.UsersExternalQueryRepository,
            security_devices_query_repository_1.SecurityDevicesQueryRepository,
            auth_query_repository_1.AuthQueryRepository,
            auth_service_1.AuthService,
            local_strategy_1.LocalStrategy,
            crypto_service_1.CryptoService,
            email_service_1.EmailService,
            jwt_strategy_1.JwtStrategy,
            users_external_query_repository_1.UsersExternalQueryRepository,
        ],
        exports: [users_external_query_repository_1.UsersExternalQueryRepository],
    })
], UserAccountsModule);
//# sourceMappingURL=userAccounts.module.js.map