"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateBlogInputDto = void 0;
const openapi = require("@nestjs/swagger");
class CreateBlogInputDto {
    name;
    description;
    websiteUrl;
    static _OPENAPI_METADATA_FACTORY() {
        return { name: { required: true, type: () => String }, description: { required: true, type: () => String }, websiteUrl: { required: true, type: () => String } };
    }
}
exports.CreateBlogInputDto = CreateBlogInputDto;
//# sourceMappingURL=blogs.input-dto.js.map