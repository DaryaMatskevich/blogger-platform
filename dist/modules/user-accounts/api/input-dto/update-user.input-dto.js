"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUserInputDto = void 0;
const openapi = require("@nestjs/swagger");
class UpdateUserInputDto {
    email;
    static _OPENAPI_METADATA_FACTORY() {
        return { email: { required: true, type: () => String } };
    }
}
exports.UpdateUserInputDto = UpdateUserInputDto;
//# sourceMappingURL=update-user.input-dto.js.map