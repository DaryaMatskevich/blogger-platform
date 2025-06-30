"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUserInputDto = void 0;
const openapi = require("@nestjs/swagger");
class CreateUserInputDto {
    login;
    password;
    email;
    static _OPENAPI_METADATA_FACTORY() {
        return { login: { required: true, type: () => String }, password: { required: true, type: () => String }, email: { required: true, type: () => String } };
    }
}
exports.CreateUserInputDto = CreateUserInputDto;
//# sourceMappingURL=users.input-dto.js.map