// dto/users-top-query-params.dto.ts
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UsersTopQueryParamsDto {
  @IsOptional()
  @IsString({ each: true })
  sort?: string[] = ['avgScores desc', 'sumScore desc'];

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
