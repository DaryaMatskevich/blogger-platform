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
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const mongoose_1 = require("@nestjs/mongoose");
const userAccounts_module_1 = require("./modules/user-accounts/userAccounts.module");
const core_module_1 = require("./core/core.module");
const testing_module_1 = require("./modules/testing/testing.module");
const config_1 = require("@nestjs/config");
const serve_static_1 = require("@nestjs/serve-static");
const path_1 = require("path");
const bloggers_platform_module_1 = require("./modules/bloggers-platform/bloggers-platform.module");
const core_1 = require("@nestjs/core");
const all_exeptions_filter_1 = require("./core/exeptions/filters/all-exeptions.filter");
const domain_exeptions_fiter_1 = require("./core/exeptions/filters/domain-exeptions.fiter");
const notifications_module_1 = require("./modules/notifications/notifications.module");
let AppModule = class AppModule {
    constructor() {
        common_1.Logger.log(`MongoDB URL: ${process.env.MONGO_URL}`, 'AppModule');
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot(),
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: (0, path_1.join)(__dirname, '..', 'swagger-static'),
                serveRoot: process.env.NODE_ENV === 'development' ? '/' : 'api/swagger',
            }),
            mongoose_1.MongooseModule.forRoot(process.env.MONGO_URL, {
                dbName: 'nest-bloggers-platform'
            }),
            userAccounts_module_1.UserAccountsModule,
            testing_module_1.TestingModule,
            bloggers_platform_module_1.BloggersPlatformModule,
            core_module_1.CoreModule,
            notifications_module_1.NotificationsModule
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService,
            {
                provide: core_1.APP_FILTER,
                useClass: domain_exeptions_fiter_1.DomainHttpExceptionsFilter,
            },
            {
                provide: core_1.APP_FILTER,
                useClass: all_exeptions_filter_1.AllHttpExceptionsFilter
            },
        ],
    }),
    __metadata("design:paramtypes", [])
], AppModule);
//# sourceMappingURL=app.module.js.map