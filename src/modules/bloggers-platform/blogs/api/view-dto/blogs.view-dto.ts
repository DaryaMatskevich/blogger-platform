import { BlogDocument } from "../../domain/dto/blog.entity";

export class BlogViewDto {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: Date;
  isMembership: Boolean

  
  static mapToView(blog: BlogDocument): BlogViewDto {
    const dto = new BlogViewDto();
    dto.id = blog._id.toString();
    dto.name = blog.name;
    dto.description = blog.description;
    dto.websiteUrl = blog.websiteUrl;
    dto.createdAt = blog.createdAt;
    dto.isMembership = blog.isMembership

    return dto;
  }
}