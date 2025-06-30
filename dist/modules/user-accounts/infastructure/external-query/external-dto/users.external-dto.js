"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserExternalDto = void 0;
class UserExternalDto {
    id;
    login;
    email;
    createdAt;
    firstName;
    lastName;
    static mapToView(user) {
        const dto = new UserExternalDto();
        dto.email = user.email;
        dto.login = user.login;
        dto.id = user._id.toString();
        dto.createdAt = user.createdAt;
        dto.firstName = user.name.firstName;
        dto.lastName = user.name.lastName;
        return dto;
    }
}
exports.UserExternalDto = UserExternalDto;
//# sourceMappingURL=users.external-dto.js.map