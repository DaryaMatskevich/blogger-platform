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
exports.UsersRepository = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const common_1 = require("@nestjs/common");
const user_entity_1 = require("../domain/dto/user.entity");
let UsersRepository = class UsersRepository {
    UserModel;
    constructor(UserModel) {
        this.UserModel = UserModel;
    }
    async findById(id) {
        return this.UserModel.findOne({
            _id: id,
            deletedAt: null,
        });
    }
    async save(user) {
        await user.save();
    }
    async findOrNotFoundFail(id) {
        const user = await this.findById(id);
        if (!user) {
            throw new common_1.NotFoundException('user not found');
        }
        return user;
    }
    findByLogin(login) {
        return this.UserModel.findOne({ login });
    }
    async loginIsExist(login) {
        return !!(await this.UserModel.countDocuments({ login: login }));
    }
};
exports.UsersRepository = UsersRepository;
exports.UsersRepository = UsersRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_entity_1.User.name)),
    __metadata("design:paramtypes", [Object])
], UsersRepository);
//# sourceMappingURL=users.repository.js.map