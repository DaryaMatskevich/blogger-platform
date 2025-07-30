import { IsStringWithTrim } from "@src/core/decorators/validation/is-string-with-trim";
import { UpdateBlogDto } from "../../dto/update-blog.dto";
import { descriptionConstraints, nameConstraints, websiteUrlConstraints } from "../../domain/dto/blog.entity";
import { IsUrl } from "class-validator";






export class UpdateBlogInputDto implements UpdateBlogDto {
  
  @IsStringWithTrim(nameConstraints.minLength, nameConstraints.maxLength)
  name: string;

  @IsStringWithTrim(descriptionConstraints.minLength, descriptionConstraints.maxLength)
  description: string;

  @IsStringWithTrim(websiteUrlConstraints.minLength, websiteUrlConstraints.maxlength)
  @IsUrl()
  websiteUrl: string;
}