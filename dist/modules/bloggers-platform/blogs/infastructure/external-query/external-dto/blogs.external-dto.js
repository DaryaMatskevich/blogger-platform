"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlogExternalDto = void 0;
class BlogExternalDto {
    id;
    name;
    description;
    websiteUrl;
    createdAt;
    isMembership;
    static mapToView(blog) {
        const dto = new BlogExternalDto();
        dto.id = blog._id.toString();
        dto.name = blog.name;
        dto.description = blog.description;
        dto.createdAt = blog.createdAt;
        dto.isMembership = blog.isMembership;
        return dto;
    }
}
exports.BlogExternalDto = BlogExternalDto;
//# sourceMappingURL=blogs.external-dto.js.map