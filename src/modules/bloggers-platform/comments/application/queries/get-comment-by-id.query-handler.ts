import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CommentViewDto } from '../../api/view-dto/comments.view.dto';
import { CommentsQueryRepository } from '../../infrastructute/query/comments.query-repository';

// import { CommentLikesQueryRepository } from '../../infrastructute/likes/commentLikesQueryRepository';

export class GetCommentByIdQuery {
  constructor(
    public id: string,
    // public userId: string | null,
  ) {}
}

@QueryHandler(GetCommentByIdQuery)
export class GetCommenttByIdQueryHandler
  implements IQueryHandler<GetCommentByIdQuery, CommentViewDto>
{
  constructor(
    private readonly commentsQueryRepository: CommentsQueryRepository,
    //private commentLikesQueryRepository: CommentLikesQueryRepository,
  ) {}

  async execute(query: GetCommentByIdQuery): Promise<CommentViewDto> {
    const commentIdNum = parseInt(query.id, 10);
    // if(userId) {
    // const userIdNum = parseInt(query.userId?, 10);}
    //
    // if (query.userId) {
    //   const likeComment =
    //     await this.likesCommentQueryRepository.getCurrentUserStatus(
    //       // userIdNum,
    //  commentIdNum,
    //     );
    //   console.log(likeComment);
    //   if (likeComment) {
    //     myStatus = likeComment.status;
    //     console.log(myStatus);
    //   }
    // }

    return this.commentsQueryRepository.getByIdOrNotFoundFail(commentIdNum);
  }
}
