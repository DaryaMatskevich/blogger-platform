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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlogsQueryRepository = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const common_1 = require("@nestjs/common");
const base_paginated_view_dto_1 = require("../../../../../core/dto/base.paginated.view.dto");
const blog_entity_1 = require("../../domain/dto/blog.entity");
const blogs_view_dto_1 = require("../../api/view-dto/blogs.view-dto");
let BlogsQueryRepository = class BlogsQueryRepository {
    BlogModel;
    constructor(BlogModel) {
        this.BlogModel = BlogModel;
    }
    async getByIdOrNotFoundFail(id) {
        const blog = await this.BlogModel.findOne({
            _id: id,
            deletedAt: null,
        });
        if (!blog) {
            throw new common_1.NotFoundException('user not found');
        }
        return blogs_view_dto_1.BlogViewDto.mapToView(blog);
    }
    async getAll(query) {
        const filter = {
            deletedAt: null,
        };
        if (query.searchNameTerm) {
            filter.name = {
                $regex: query.searchNameTerm,
                $options: 'i'
            };
        }
        const blogs = await this.BlogModel.find(filter)
            .sort({ [query.sortBy]: query.sortDirection })
            .skip(query.calculateSkip())
            .limit(query.pageSize);
        const totalCount = await this.BlogModel.countDocuments(filter);
        const items = blogs.map(blogs_view_dto_1.BlogViewDto.mapToView);
        return base_paginated_view_dto_1.PaginatedViewDto.mapToView({
            page: query.pageNumber,
            size: query.pageSize,
            totalCount,
            items
        });
    }
};
exports.BlogsQueryRepository = BlogsQueryRepository;
exports.BlogsQueryRepository = BlogsQueryRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(blog_entity_1.Blog.name)),
    __metadata("design:paramtypes", [Object])
], BlogsQueryRepository);
//# sourceMappingURL=blogs.query-repository.js.map