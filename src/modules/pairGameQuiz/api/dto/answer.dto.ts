import { IsNotEmpty, IsString } from 'class-validator';

export class AnswerDto {
  @IsString()
  @IsNotEmpty()
  answer: string;
}
