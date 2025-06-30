"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserViewDto = void 0;
const openapi = require("@nestjs/swagger");
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
//# sourceMappingURL=users.view-dto.js.map