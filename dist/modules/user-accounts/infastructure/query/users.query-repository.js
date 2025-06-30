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
exports.UsersQueryRepository = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const users_view_dto_1 = require("../../api/view-dto/users.view-dto");
const common_1 = require("@nestjs/common");
const user_entity_1 = require("../../domain/dto/user.entity");
const base_paginated_view_dto_1 = require("../../../../core/dto/base.paginated.view.dto");
let UsersQueryRepository = class UsersQueryRepository {
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
        return users_view_dto_1.UserViewDto.mapToView(user);
    }
    async getAll(query) {
        const filter = {
            deletedAt: null,
        };
        if (query.searchLoginTerm) {
            filter.$or = filter.$or || [];
            filter.$or.push({
                login: { $regex: query.searchLoginTerm, $options: 'i' },
            });
        }
        if (query.searchEmailTerm) {
            filter.$or = filter.$or || [];
            filter.$or.push({
                email: { $regex: query.searchEmailTerm, $options: 'i' },
            });
        }
        const users = await this.UserModel.find(filter)
            .sort({ [query.sortBy]: query.sortDirection })
            .skip(query.calculateSkip())
            .limit(query.pageSize);
        const totalCount = await this.UserModel.countDocuments(filter);
        const items = users.map(users_view_dto_1.UserViewDto.mapToView);
        return base_paginated_view_dto_1.PaginatedViewDto.mapToView({
            page: query.pageNumber,
            size: query.pageSize,
            totalCount,
            items
        });
    }
};
exports.UsersQueryRepository = UsersQueryRepository;
exports.UsersQueryRepository = UsersQueryRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_entity_1.User.name)),
    __metadata("design:paramtypes", [Object])
], UsersQueryRepository);
//# sourceMappingURL=users.query-repository.js.map