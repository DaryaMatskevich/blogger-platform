import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CommentViewDto } from '../../api/view-dto/comments.view.dto';
import { CommentsQueryRepository } from '../../infrastructute/query/comments.query-repository';

import { CommentLikesQueryRepository } from '../../infrastructute/likes/commentLikesQueryRepository';

export class GetCommentByIdQuery {
  constructor(
    public id: string,
    public userId: string | null,
  ) {}
}

@QueryHandler(GetCommentByIdQuery)
export class GetCommenttByIdQueryHandler
  implements IQueryHandler<GetCommentByIdQuery, CommentViewDto>
{
  constructor(
    private readonly commentsQueryRepository: CommentsQueryRepository,
    private readonly commentLikesQueryRepository: CommentLikesQueryRepository,
  ) {}

  async execute(query: GetCommentByIdQuery): Promise<CommentViewDto> {
    const commentIdNum = parseInt(query.id, 10);

    if (query.userId) {
      const userIdNum = parseInt(query.userId, 10);
      const likeStatus =
        await this.commentLikesQueryRepository.getCurrentUserStatus(
          userIdNum,
          commentIdNum,
        );
      console.log(likeStatus);
      if (likeStatus) {
        return this.commentsQueryRepository.getByIdWithStatusOrNotFoundFail(
          commentIdNum,
          likeStatus,
        );
      }
    }

    return this.commentsQueryRepository.getByIdOrNotFoundFail(commentIdNum);
  }
}
