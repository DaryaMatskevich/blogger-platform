import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateQuestionInputDto {
  @IsOptional()
  @IsString()
  @Length(10, 500)
  @Transform(({ value }) => value?.trim())
  body?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @Transform(({ value }) => value?.map((v: string) => v.trim()))
  correctAnswers?: string[];

  @IsOptional()
  @IsBoolean()
  published?: boolean;
}
