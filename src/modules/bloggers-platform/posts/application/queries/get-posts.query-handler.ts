import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view.dto';
import { GetPostsQueryParams } from '../../api/input-dto/get-posts-query-params.input-dto';
import { PostViewDto } from '../../api/view-dto/posts.view-dto';
import { PostsQueryRepository } from '../../infactructure/query/posts.query-repository';

export class GetPostsQuery {
  constructor(
    public queryParams: GetPostsQueryParams,
    public userId: string | null,
  ) {}
}

@QueryHandler(GetPostsQuery)
export class GetPostsQueryHandler
  implements IQueryHandler<GetPostsQuery, PaginatedViewDto<PostViewDto[]>>
{
  constructor(
    @Inject(PostsQueryRepository)
    private readonly postsQueryRepository: PostsQueryRepository,
  ) {}

  async execute(
    query: GetPostsQuery,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    if (query.userId) {
      const userIdNum = parseInt(query.userId, 10);
      return this.postsQueryRepository.getAllwithLikeStatus(
        query.queryParams,
        userIdNum,
      );
    } else {
      return this.postsQueryRepository.getAll(query.queryParams);
    }
  }
}
