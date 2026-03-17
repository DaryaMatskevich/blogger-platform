import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CommentViewDto } from '../../api/view-dto/comments.view.dto';
import { CommentsQueryRepository } from '../../infrastructute/query/comments.query-repository';

export class GetCommentByIdQuery {
  constructor(public id: number) {}
}

@QueryHandler(GetCommentByIdQuery)
export class GetCommenttByIdQueryHandler
  implements IQueryHandler<GetCommentByIdQuery, CommentViewDto>
{
  constructor(
    private readonly commentsQueryRepository: CommentsQueryRepository,
  ) {}

  async execute(query: GetCommentByIdQuery): Promise<CommentViewDto> {
    return this.commentsQueryRepository.getByIdOrNotFoundFail(query.id);
  }
}
