import { IsStringWithTrim } from "../../../../../core/decorators/validation/is-string-with-trim";
import { IsString, IsUrl, Matches, MaxLength} from "class-validator";
import { descriptionConstraints, nameConstraints, websiteUrlConstraints } from "../../domain/dto/blog.entity";

//dto для боди при создании юзера. Сюда могут быть добавлены декораторы swagger
export class CreateBlogInputDto {
  @IsStringWithTrim(nameConstraints.minLength, nameConstraints.maxLength)
    name: string;

  @IsStringWithTrim(descriptionConstraints.minLength, descriptionConstraints.maxLength)
  description: string;

 
  @IsStringWithTrim(websiteUrlConstraints.minLength, websiteUrlConstraints.maxlength)
  @Matches(/^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/, {
    message: 'websiteUrl must be a valid URL starting with https:// , field : websiteUrl',
  })
  websiteUrl: string;
}