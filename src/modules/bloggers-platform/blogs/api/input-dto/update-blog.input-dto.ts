import { UpdateBlogDto } from "../../dto/update-blog.dto";




export class UpdateBlogInputDto implements UpdateBlogDto {
  name: string;
  description: string;
  websiteUrl: string;
}