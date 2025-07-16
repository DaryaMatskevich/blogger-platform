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
exports.BlogsController = void 0;
const openapi = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const blogs_input_dto_1 = require("./input-dto/blogs.input-dto");
const swagger_1 = require("@nestjs/swagger");
const update_blog_input_dto_1 = require("./input-dto/update-blog.input-dto");
const get_blogs_query_params_input_dto_1 = require("./input-dto/get-blogs-query-params.input-dto");
const blogs_service_1 = require("../application/blogs.service");
const blogs_query_repository_1 = require("../infastructure/query/blogs.query-repository");
const get_posts_query_params_input_dto_1 = require("../../posts/api/input-dto/get-posts-query-params.input-dto");
const posts_input_dto_1 = require("../../posts/api/input-dto/posts.input-dto");
const posts_service_1 = require("../../posts/application/posts.service");
const posts_query_repository_1 = require("../../posts/infactructure/query/posts.query-repository");
let BlogsController = class BlogsController {
    blogsService;
    postsService;
    blogsQueryRepository;
    postsQueryRepository;
    constructor(blogsService, postsService, blogsQueryRepository, postsQueryRepository) {
        this.blogsService = blogsService;
        this.postsService = postsService;
        this.blogsQueryRepository = blogsQueryRepository;
        this.postsQueryRepository = postsQueryRepository;
        console.log('UsersController created');
    }
    async getById(id) {
        return this.blogsQueryRepository.getByIdOrNotFoundFail(id);
    }
    async getAll(query) {
        return this.blogsQueryRepository.getAll(query);
    }
    async createBlog(body) {
        const blogId = await this.blogsService.createBlog(body);
        return this.blogsQueryRepository.getByIdOrNotFoundFail(blogId);
    }
    async updateBlog(id, body) {
        await this.blogsService.updateBlog(id, body);
    }
    async deleteBlog(id) {
        return this.blogsService.deleteBlog(id);
    }
    async getAllPostsForBlog(id, query) {
        const blogExists = await this.blogsService.blogExists(id);
        if (!blogExists) {
            throw new common_1.NotFoundException('Blog not found');
        }
        return this.blogsService.getAllPostsForBlog(id, query);
    }
    async createPostForBlog(blogId, body) {
        const blogExists = await this.blogsService.blogExists(blogId);
        if (!blogExists) {
            throw new common_1.NotFoundException('Blog not found');
        }
        const postId = await this.postsService.createPostForBlog(blogId, body);
        return this.postsQueryRepository.getByIdOrNotFoundFail(postId);
    }
};
exports.BlogsController = BlogsController;
__decorate([
    (0, swagger_1.ApiParam)({ name: 'id' }),
    (0, common_1.Get)(':id'),
    openapi.ApiResponse({ status: 200, type: require("./view-dto/blogs.view-dto").BlogViewDto }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BlogsController.prototype, "getById", null);
__decorate([
    (0, common_1.Get)(),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [get_blogs_query_params_input_dto_1.GetBlogsQueryParams]),
    __metadata("design:returntype", Promise)
], BlogsController.prototype, "getAll", null);
__decorate([
    (0, common_1.Post)(),
    openapi.ApiResponse({ status: 201, type: require("./view-dto/blogs.view-dto").BlogViewDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [blogs_input_dto_1.CreateBlogInputDto]),
    __metadata("design:returntype", Promise)
], BlogsController.prototype, "createBlog", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.HttpCode)(204),
    openapi.ApiResponse({ status: 204 }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_blog_input_dto_1.UpdateBlogInputDto]),
    __metadata("design:returntype", Promise)
], BlogsController.prototype, "updateBlog", null);
__decorate([
    (0, swagger_1.ApiParam)({ name: 'id' }),
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    openapi.ApiResponse({ status: common_1.HttpStatus.NO_CONTENT }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BlogsController.prototype, "deleteBlog", null);
__decorate([
    (0, swagger_1.ApiParam)({ name: 'id' }),
    (0, common_1.Get)(':id/posts'),
    openapi.ApiResponse({ status: 200 }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, get_posts_query_params_input_dto_1.GetPostsQueryParams]),
    __metadata("design:returntype", Promise)
], BlogsController.prototype, "getAllPostsForBlog", null);
__decorate([
    (0, common_1.Post)(':id/posts'),
    openapi.ApiResponse({ status: 201, type: require("../../posts/api/view-dto/posts.view-dto").PostViewDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, posts_input_dto_1.CreatePostForBlogInputDto]),
    __metadata("design:returntype", Promise)
], BlogsController.prototype, "createPostForBlog", null);
exports.BlogsController = BlogsController = __decorate([
    (0, common_1.Controller)('blogs'),
    __metadata("design:paramtypes", [blogs_service_1.BlogsService,
        posts_service_1.PostsService,
        blogs_query_repository_1.BlogsQueryRepository,
        posts_query_repository_1.PostsQueryRepository])
], BlogsController);
//# sourceMappingURL=blogs.controller.js.map