// users-top-query-params.dto.ts
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class UsersTopQueryParamsDto {
  @IsOptional()
  @Transform(({ value }) => {
    // Если передан один параметр как строка → оборачиваем в массив
    if (typeof value === 'string') return [value];
    // Если массив — оставляем как есть
    if (Array.isArray(value)) return value;
    // Если ничего не передано — используем значение по умолчанию
    return ['avgScores desc', 'sumScore desc'];
  })
  @IsString({ each: true })
  sort: string[] = ['avgScores desc', 'sumScore desc'];

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageNumber: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize: number = 10;
}
