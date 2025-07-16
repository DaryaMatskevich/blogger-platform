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
exports.BlogsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const blog_entity_1 = require("../domain/dto/blog.entity");
const blogs_repository_1 = require("../infastructure/blogs.repository");
const posts_query_repository_1 = require("../../posts/infactructure/query/posts.query-repository");
let BlogsService = class BlogsService {
    BlogModel;
    blogsRepository;
    postsQueryRepository;
    constructor(BlogModel, blogsRepository, postsQueryRepository) {
        this.BlogModel = BlogModel;
        this.blogsRepository = blogsRepository;
        this.postsQueryRepository = postsQueryRepository;
    }
    async createBlog(dto) {
        const blog = this.BlogModel.createInstance({
            name: dto.name,
            description: dto.description,
            websiteUrl: dto.websiteUrl
        });
        await this.blogsRepository.save(blog);
        return blog._id.toString();
    }
    async updateBlog(id, dto) {
        const blog = await this.blogsRepository.findOrNotFoundFail(id);
        blog.update(dto);
        await this.blogsRepository.save(blog);
        return blog._id.toString();
    }
    async deleteBlog(id) {
        const blog = await this.blogsRepository.findOrNotFoundFail(id);
        blog.makeDeleted();
        await this.blogsRepository.save(blog);
    }
    async getAllPostsForBlog(id, query) {
        const posts = await this.postsQueryRepository.getPostsForBlog(query, id);
        return posts;
    }
    async blogExists(id) {
        return this.BlogModel.exists({
            _id: id,
            deletedAt: null
        });
    }
};
exports.BlogsService = BlogsService;
exports.BlogsService = BlogsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(blog_entity_1.Blog.name)),
    __metadata("design:paramtypes", [Object, blogs_repository_1.BlogsRepository,
        posts_query_repository_1.PostsQueryRepository])
], BlogsService);
//# sourceMappingURL=blogs.service.js.map