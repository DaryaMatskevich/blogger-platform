import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view.dto';
import { GetPostsQueryParams } from '../../api/input-dto/get-posts-query-params.input-dto';
import { PostViewDto } from '../../api/view-dto/posts.view-dto';
import { PostsQueryRepository } from '../../infactructure/query/posts.query-repository';

export class GetPostsQuery {
  constructor(public queryParams: GetPostsQueryParams) {}
}

@QueryHandler(GetPostsQuery)
export class GetPostsQueryHandler
  implements IQueryHandler<GetPostsQuery, PaginatedViewDto<PostViewDto[]>>
{
  constructor(private readonly postsQueryRepository: PostsQueryRepository) {}

  async execute(
    query: GetPostsQuery,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    const { queryParams } = query;
    return this.postsQueryRepository.getAllPostsgWithPagination(queryParams);
  }
}
