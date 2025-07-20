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
exports.UserSchema = exports.User = exports.emailConstraints = exports.passwordConstraints = exports.loginConstraints = void 0;
const mongoose_1 = require("@nestjs/mongoose");
exports.loginConstraints = {
    minLength: 3,
    maxLength: 10
};
exports.passwordConstraints = {
    minLength: 6,
    maxLength: 20
};
exports.emailConstraints = {
    match: /^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/,
};
let User = class User {
    login;
    passwordHash;
    email;
    isEmailConfirmed;
    confirmationCode;
    confirmationCodeCreatedAt;
    confirmationCodeExpiresAt;
    recoveryCode;
    recoveryCodeCreatedAt;
    recoveryCodeExpiresAt;
    createdAt;
    updatedAt;
    deletedAt;
    get id() {
        return this._id.toString();
    }
    static createInstance(dto) {
        const user = new this();
        user.login = dto.login;
        user.passwordHash = dto.passwordHash;
        user.email = dto.email;
        user.isEmailConfirmed = false;
        return user;
    }
    makeDeleted() {
        if (this.deletedAt !== null) {
            throw new Error('Entity already deleted');
        }
        this.deletedAt = new Date();
    }
    setConfirmationCode(code) {
        if (!code || typeof code !== 'string') {
            throw new Error('Confirmation code must be a non-empty string');
        }
        this.confirmationCode = code;
        this.confirmationCodeCreatedAt = new Date();
        this.confirmationCodeExpiresAt = new Date();
        this.confirmationCodeExpiresAt.setDate(this.confirmationCodeExpiresAt.getDate() + 2);
        this.isEmailConfirmed = false;
    }
    setRecoveryCode(code) {
        if (!code || typeof code !== 'string') {
            throw new Error('Confirmation code must be a non-empty string');
        }
        this.recoveryCode = code;
        this.recoveryCodeCreatedAt = new Date();
        this.recoveryCodeExpiresAt = new Date();
        this.recoveryCodeExpiresAt = new Date(Date.now() + 60 * 60 * 1000);
    }
    confirmEmail() {
        this.isEmailConfirmed = true;
        this.confirmationCode = null;
        this.confirmationCodeCreatedAt = null;
        this.confirmationCodeExpiresAt = null;
    }
    update(dto) {
        if (dto.email !== this.email) {
            this.isEmailConfirmed = false;
            this.email = dto.email;
        }
    }
    setNewPasswordHash(newPasswordHash) {
        this.passwordHash = newPasswordHash;
    }
};
exports.User = User;
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true, ...exports.loginConstraints }),
    __metadata("design:type", String)
], User.prototype, "login", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true }),
    __metadata("design:type", String)
], User.prototype, "passwordHash", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, min: 5, required: true, ...exports.emailConstraints }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, required: true, default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "isEmailConfirmed", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, nullable: true }),
    __metadata("design:type", Object)
], User.prototype, "confirmationCode", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, nullable: true }),
    __metadata("design:type", Object)
], User.prototype, "confirmationCodeCreatedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, nullable: true }),
    __metadata("design:type", Object)
], User.prototype, "confirmationCodeExpiresAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, nullable: true }),
    __metadata("design:type", Object)
], User.prototype, "recoveryCode", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, nullable: true }),
    __metadata("design:type", Object)
], User.prototype, "recoveryCodeCreatedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, nullable: true }),
    __metadata("design:type", Object)
], User.prototype, "recoveryCodeExpiresAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, nullable: true, default: null }),
    __metadata("design:type", Object)
], User.prototype, "deletedAt", void 0);
exports.User = User = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], User);
exports.UserSchema = mongoose_1.SchemaFactory.createForClass(User);
exports.UserSchema.loadClass(User);
//# sourceMappingURL=user.entity.js.map