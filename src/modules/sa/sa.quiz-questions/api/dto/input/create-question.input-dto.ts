// src/modules/quiz/dto/input/create-question.input-dto.ts
import { ArrayMinSize, IsArray, IsString, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateQuestionInputDto {
  @IsString()
  @Length(10, 500)
  @Transform(({ value }) => value?.trim())
  body: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @Transform(({ value }) => value?.map((v: string) => v.trim()))
  correctAnswers: string[];
}
