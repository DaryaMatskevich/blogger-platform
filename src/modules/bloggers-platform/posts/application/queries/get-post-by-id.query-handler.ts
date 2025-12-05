import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PostViewDto } from '../../api/view-dto/posts.view-dto';
import { PostsQueryRepository } from '../../infactructure/query/posts.query-repository';

export class GetPostByIdQuery {
  constructor(
    public id: string,
    public userId: string | null,
  ) {}
}

@QueryHandler(GetPostByIdQuery)
export class GetPostByIdQueryHandler
  implements IQueryHandler<GetPostByIdQuery, PostViewDto>
{
  constructor(
    @Inject(PostsQueryRepository)
    private readonly postsQueryRepository: PostsQueryRepository,
  ) {}

  async execute(query: GetPostByIdQuery): Promise<PostViewDto> {
    // console.log(query.userId);
    const postIdNum = parseInt(query.id, 10);
    if (query.userId) {
      const userIdNum = parseInt(query.userId, 10);
      return this.postsQueryRepository.getByIdWithStatusOrNotFoundFail(
        postIdNum,
        userIdNum,
      );
    } else {
      return this.postsQueryRepository.getByIdOrNotFoundFail(postIdNum);
    }
  }
}
