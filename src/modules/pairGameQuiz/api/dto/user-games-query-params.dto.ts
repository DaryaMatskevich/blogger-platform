import { IsEnum, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

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
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return 1;
    const num = Number(value);
    return isNaN(num) ? 1 : num;
  })
  pageNumber: number = 1;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return 10;
    const num = Number(value);
    return isNaN(num) ? 10 : num;
  })
  pageSize: number = 10;
}
