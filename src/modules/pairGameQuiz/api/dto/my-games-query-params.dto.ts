// api/dto/my-games-query-params.dto.ts
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc',
}

export class MyGamesQueryParamsDto {
  @IsOptional()
  @IsEnum(['pairCreatedDate', 'startGameDate', 'finishGameDate'])
  sort: string = 'pairCreatedDate';

  @IsOptional()
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
