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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const users_service_1 = require("../application/users.service");
const users_input_dto_1 = require("./input-dto/users.input-dto");
const swagger_1 = require("@nestjs/swagger");
const update_user_input_dto_1 = require("./input-dto/update-user.input-dto");
const get_users_query_params_input_dto_1 = require("./input-dto/get-users-query-params.input-dto");
const users_query_repository_1 = require("../infastructure/query/users.query-repository");
const basic_auth_guard_1 = require("../guards/basic/basic-auth.guard");
const public_decorator_1 = require("../guards/decorators/param/public.decorator");
let UsersController = class UsersController {
    usersQueryRepository;
    usersService;
    constructor(usersQueryRepository, usersService) {
        this.usersQueryRepository = usersQueryRepository;
        this.usersService = usersService;
        console.log('UsersController created');
    }
    async getById(id) {
        return this.usersQueryRepository.getByIdOrNotFoundFail(id);
    }
    async getAll(query) {
        return this.usersQueryRepository.getAll(query);
    }
    async createUser(body) {
        const userId = await this.usersService.createUser(body);
        return this.usersQueryRepository.getByIdOrNotFoundFail(userId);
    }
    async updateUser(id, body) {
        const userId = await this.usersService.updateUser(id, body);
        return this.usersQueryRepository.getByIdOrNotFoundFail(userId);
    }
    async deleteUser(id) {
        return this.usersService.deleteUser(id);
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, swagger_1.ApiParam)({ name: 'id' }),
    (0, common_1.Get)(':id'),
    openapi.ApiResponse({ status: 200, type: require("./view-dto/users.view-dto").UserViewDto }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getById", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [get_users_query_params_input_dto_1.GetUsersQueryParams]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getAll", null);
__decorate([
    (0, common_1.Post)(),
    openapi.ApiResponse({ status: 201, type: require("./view-dto/users.view-dto").UserViewDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [users_input_dto_1.CreateUserInputDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "createUser", null);
__decorate([
    (0, common_1.Put)(':id'),
    openapi.ApiResponse({ status: 200, type: require("./view-dto/users.view-dto").UserViewDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_user_input_dto_1.UpdateUserInputDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateUser", null);
__decorate([
    (0, swagger_1.ApiParam)({ name: 'id' }),
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    openapi.ApiResponse({ status: common_1.HttpStatus.NO_CONTENT }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "deleteUser", null);
exports.UsersController = UsersController = __decorate([
    (0, common_1.Controller)('users'),
    (0, common_1.UseGuards)(basic_auth_guard_1.BasicAuthGuard),
    __metadata("design:paramtypes", [users_query_repository_1.UsersQueryRepository,
        users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map