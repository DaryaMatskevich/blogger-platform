import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc',
}

export class UserGamesQueryParamsDto {
  @IsOptional()
  @Transform(({ value }) => value?.toLowerCase())
  @IsEnum(['pairCreatedDate', 'startGameDate', 'finishGameDate', 'status'])
  sortBy: string = 'pairCreatedDate';

  @IsOptional()
  @Transform(({ value }) => value?.toLowerCase())
  @IsEnum(SortDirection)
  sortDirection: SortDirection = SortDirection.DESC;

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
