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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const user_entity_1 = require("../domain/dto/user.entity");
const users_repository_1 = require("../infastructure/users.repository");
const email_service_1 = require("../../../modules/notifications/email.service");
const crypto_service_1 = require("./crypto.service");
const uuid_1 = require("uuid");
let UsersService = class UsersService {
    UserModel;
    usersRepository;
    emailService;
    cryptoService;
    constructor(UserModel, usersRepository, emailService, cryptoService) {
        this.UserModel = UserModel;
        this.usersRepository = usersRepository;
        this.emailService = emailService;
        this.cryptoService = cryptoService;
    }
    async createUser(dto) {
        const passwordHash = await this.cryptoService.createPasswordHash(dto.password);
        const user = this.UserModel.createInstance({
            login: dto.login,
            passwordHash: passwordHash,
            email: dto.email,
        });
        await this.usersRepository.save(user);
        return user._id.toString();
    }
    async updateUser(id, dto) {
        const user = await this.usersRepository.findOrNotFoundFail(id);
        user.update(dto);
        await this.usersRepository.save(user);
        return user._id.toString();
    }
    async deleteUser(id) {
        const user = await this.usersRepository.findOrNotFoundFail(id);
        user.makeDeleted();
        await this.usersRepository.save(user);
    }
    async registerUser(dto) {
        const createdUserId = await this.createUser(dto);
        const confirmCode = (0, uuid_1.v4)();
        const user = await this.usersRepository.findOrNotFoundFail(createdUserId);
        user.setConfirmationCode(confirmCode);
        await this.usersRepository.save(user);
        this.emailService
            .sendConfirmationEmail(user.email, confirmCode)
            .catch(console.error);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_entity_1.User.name)),
    __metadata("design:paramtypes", [Object, users_repository_1.UsersRepository,
        email_service_1.EmailService,
        crypto_service_1.CryptoService])
], UsersService);
//# sourceMappingURL=users.service.js.map