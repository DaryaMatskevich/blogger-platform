"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeViewDto = exports.UserViewDto = void 0;
const openapi = require("@nestjs/swagger");
const swagger_1 = require("@nestjs/swagger");
class UserViewDto {
    id;
    login;
    email;
    createdAt;
    static mapToView(user) {
        const dto = new UserViewDto();
        dto.id = user._id.toString();
        dto.login = user.login;
        dto.email = user.email;
        dto.createdAt = user.createdAt;
        return dto;
    }
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, login: { required: true, type: () => String }, email: { required: true, type: () => String }, createdAt: { required: true, type: () => Date } };
    }
}
exports.UserViewDto = UserViewDto;
class MeViewDto extends (0, swagger_1.OmitType)(UserViewDto, [
    'createdAt',
    'id',
]) {
    userId;
    static mapToView(user) {
        const dto = new MeViewDto();
        dto.email = user.email;
        dto.login = user.login;
        dto.userId = user._id.toString();
        return dto;
    }
    static _OPENAPI_METADATA_FACTORY() {
        return { userId: { required: true, type: () => String } };
    }
}
exports.MeViewDto = MeViewDto;
//# sourceMappingURL=users.view-dto.js.map