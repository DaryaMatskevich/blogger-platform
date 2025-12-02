import { IsString, Length, IsNotEmpty } from 'class-validator';

export class UpdateCommentDto {
  @IsString()
  @IsNotEmpty()
  @Length(20, 300, {
    message: 'Content must be between 20 and 300 characters',
  })
  content: string;
}
