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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlogSchema = exports.Blog = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let Blog = class Blog {
    name;
    description;
    websiteUrl;
    isMembership;
    createdAt;
    updatedAt;
    deletedAt;
    static createInstance(dto) {
        const blog = new this();
        blog.name = dto.name;
        blog.description = dto.description;
        blog.websiteUrl = dto.websiteUrl;
        return blog;
    }
    makeDeleted() {
        if (this.deletedAt !== null) {
            throw new Error('Entity already deleted');
        }
        this.deletedAt = new Date();
    }
    update(dto) {
        if (dto.name !== this.name) {
            this.name = dto.name;
        }
        if (dto.description !== this.description) {
            this.description = dto.description;
        }
        if (dto.websiteUrl !== this.websiteUrl) {
            this.websiteUrl = dto.websiteUrl;
        }
    }
};
exports.Blog = Blog;
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true }),
    __metadata("design:type", String)
], Blog.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true }),
    __metadata("design:type", String)
], Blog.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, min: 5, required: true }),
    __metadata("design:type", String)
], Blog.prototype, "websiteUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Boolean, default: false }),
    __metadata("design:type", Boolean)
], Blog.prototype, "isMembership", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, nullable: true, default: null }),
    __metadata("design:type", Object)
], Blog.prototype, "deletedAt", void 0);
exports.Blog = Blog = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Blog);
exports.BlogSchema = mongoose_1.SchemaFactory.createForClass(Blog);
exports.BlogSchema.loadClass(Blog);
//# sourceMappingURL=blog.entity.js.map