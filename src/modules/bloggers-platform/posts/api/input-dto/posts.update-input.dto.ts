import { IsStringWithTrim } from "../../../../../core/decorators/validation/is-string-with-trim";
import { contentConstraints, shortDescriptionConstraints, titleConstraints } from "../../domain/post.entity";
import { IsString } from "class-validator";

export class UpdatePostDto {
   @IsStringWithTrim(titleConstraints.minLength, titleConstraints.maxLength)
  title: string;

 @IsStringWithTrim(shortDescriptionConstraints.minLength, shortDescriptionConstraints.maxLength)
  shortDescription: string;

  @IsStringWithTrim(contentConstraints.minLength, contentConstraints.maxLength)
  content: string;
  
  @IsString()
  blogId: string;
}