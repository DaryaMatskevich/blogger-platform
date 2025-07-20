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
exports.EmailDto = exports.NewPasswordDto = exports.CreateUserInputDto = void 0;
const openapi = require("@nestjs/swagger");
const is_string_with_trim_1 = require("../../../../core/decorators/validation/is-string-with-trim");
const user_entity_1 = require("../../domain/dto/user.entity");
const class_validator_1 = require("class-validator");
const trim_1 = require("../../../../core/decorators/transform/trim");
class CreateUserInputDto {
    login;
    password;
    email;
    static _OPENAPI_METADATA_FACTORY() {
        return { login: { required: true, type: () => String }, password: { required: true, type: () => String } };
    }
}
exports.CreateUserInputDto = CreateUserInputDto;
__decorate([
    (0, is_string_with_trim_1.IsStringWithTrim)(user_entity_1.loginConstraints.minLength, user_entity_1.loginConstraints.maxLength),
    __metadata("design:type", String)
], CreateUserInputDto.prototype, "login", void 0);
__decorate([
    (0, is_string_with_trim_1.IsStringWithTrim)(user_entity_1.passwordConstraints.minLength, user_entity_1.passwordConstraints.maxLength),
    __metadata("design:type", String)
], CreateUserInputDto.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(user_entity_1.emailConstraints.match),
    (0, trim_1.Trim)(),
    __metadata("design:type", String)
], CreateUserInputDto.prototype, "email", void 0);
class NewPasswordDto {
    newPassword;
    recoveryCode;
    static _OPENAPI_METADATA_FACTORY() {
        return { newPassword: { required: true, type: () => String }, recoveryCode: { required: true, type: () => String } };
    }
}
exports.NewPasswordDto = NewPasswordDto;
__decorate([
    (0, is_string_with_trim_1.IsStringWithTrim)(user_entity_1.passwordConstraints.minLength, user_entity_1.passwordConstraints.maxLength),
    __metadata("design:type", String)
], NewPasswordDto.prototype, "newPassword", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], NewPasswordDto.prototype, "recoveryCode", void 0);
class EmailDto {
    email;
    static _OPENAPI_METADATA_FACTORY() {
        return {};
    }
}
exports.EmailDto = EmailDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(user_entity_1.emailConstraints.match),
    (0, trim_1.Trim)(),
    __metadata("design:type", String)
], EmailDto.prototype, "email", void 0);
//# sourceMappingURL=users.input-dto.js.map