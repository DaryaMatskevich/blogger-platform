"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlogViewDto = void 0;
const openapi = require("@nestjs/swagger");
class BlogViewDto {
    id;
    name;
    description;
    websiteUrl;
    createdAt;
    isMembership;
    static mapToView(blog) {
        const dto = new BlogViewDto();
        dto.id = blog._id.toString();
        dto.name = blog.name;
        dto.description = blog.description;
        dto.websiteUrl = blog.websiteUrl;
        dto.createdAt = blog.createdAt;
        dto.isMembership = blog.isMembership;
        return dto;
    }
    static _OPENAPI_METADATA_FACTORY() {
        return { id: { required: true, type: () => String }, name: { required: true, type: () => String }, description: { required: true, type: () => String }, websiteUrl: { required: true, type: () => String }, createdAt: { required: true, type: () => Date }, isMembership: { required: true, type: () => Object } };
    }
}
exports.BlogViewDto = BlogViewDto;
//# sourceMappingURL=blogs.view-dto.js.map