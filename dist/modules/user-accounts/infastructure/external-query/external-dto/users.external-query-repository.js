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
exports.UsersExternalQueryRepository = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const common_1 = require("@nestjs/common");
const user_entity_1 = require("../../../../../modules/user-accounts/domain/dto/user.entity");
const users_external_dto_1 = require("./users.external-dto");
let UsersExternalQueryRepository = class UsersExternalQueryRepository {
    UserModel;
    constructor(UserModel) {
        this.UserModel = UserModel;
    }
    async getByIdOrNotFoundFail(id) {
        const user = await this.UserModel.findOne({
            _id: id,
            deletedAt: null,
        });
        if (!user) {
            throw new common_1.NotFoundException('user not found');
        }
        return users_external_dto_1.UserExternalDto.mapToView(user);
    }
};
exports.UsersExternalQueryRepository = UsersExternalQueryRepository;
exports.UsersExternalQueryRepository = UsersExternalQueryRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_entity_1.User.name)),
    __metadata("design:paramtypes", [Object])
], UsersExternalQueryRepository);
//# sourceMappingURL=users.external-query-repository.js.map