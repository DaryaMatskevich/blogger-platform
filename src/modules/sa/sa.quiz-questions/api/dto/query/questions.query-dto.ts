import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class QuestionsQueryDto {
  @IsOptional()
  @IsString()
  bodySearchTerm?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  published?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  pageNumber: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  pageSize: number = 10;

  @IsOptional()
  @IsString()
  sortBy: string = 'createdAt';

  @IsOptional()
  @IsString()
  sortDirection: 'asc' | 'desc' = 'desc';
}
