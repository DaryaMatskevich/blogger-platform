import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateCommentInputDto {
  @IsString()
  @IsNotEmpty()
  @Length(20, 300, {
    message: 'Content must be between 20 and 300 characters',
  })
  content: string;

  @IsString()
  @IsNotEmpty()
  postId: string;
}
