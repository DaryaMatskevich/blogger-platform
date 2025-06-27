import { BlogDocument } from "../../../domain/dto/blog.entity";


export class BlogExternalDto {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: Date;
  isMembership: Boolean;


  static mapToView(blog: BlogDocument): BlogExternalDto {
    const dto = new BlogExternalDto();

    dto.id = blog._id.toString();
    dto.name = blog.name;
    dto.description = blog.description;
    dto.createdAt = blog.createdAt;
    dto.isMembership = blog.isMembership;
   
    return dto;
  }
}