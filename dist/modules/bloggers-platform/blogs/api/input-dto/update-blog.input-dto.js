"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateBlogInputDto = void 0;
const openapi = require("@nestjs/swagger");
class UpdateBlogInputDto {
    name;
    description;
    websiteUrl;
    static _OPENAPI_METADATA_FACTORY() {
        return { name: { required: true, type: () => String }, description: { required: true, type: () => String }, websiteUrl: { required: true, type: () => String } };
    }
}
exports.UpdateBlogInputDto = UpdateBlogInputDto;
//# sourceMappingURL=update-blog.input-dto.js.map