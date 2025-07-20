import { IsString, IsUrl, Matches, MaxLength} from "class-validator";

//dto для боди при создании юзера. Сюда могут быть добавлены декораторы swagger
export class CreateBlogInputDto {
  @IsString()
  @MaxLength(15)
  name: string;

  @IsString()
  @MaxLength(500)
  description: string;

 
  @MaxLength(100)
  @Matches(/^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/, {
    message: 'websiteUrl must be a valid URL starting with https://',
  })
  websiteUrl: string;
}