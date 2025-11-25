import { IsOptional, IsString } from 'class-validator';
import { BaseQueryParams } from '../../../../../core/dto/base.query.params.input.dto';
import { PostsSortBy } from './posts-sort-by';

export class GetPostsQueryParams extends BaseQueryParams {
  @IsOptional()
  @IsString()
  sortBy = PostsSortBy.CreatedAt;
}
