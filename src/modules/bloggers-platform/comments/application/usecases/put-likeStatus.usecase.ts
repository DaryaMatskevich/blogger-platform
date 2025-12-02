import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LikesCommentRepository } from '../../infrastructute/likes/likesCommentRepository';
import { CommentsQueryRepository } from '../../../../bloggers-platform/comments/infrastructute/query/comments.query-repository';
import { LikesCommentQueryRepository } from '../../../../bloggers-platform/comments/infrastructute/likes/likesCommentQueryRepository';

export class PutLikeStatusForCommentCommand {
  constructor(
    public id: string,
    public userId: string,
    public likeStatus: 'Like' | 'Dislike' | 'None',
  ) {}
}

@CommandHandler(PutLikeStatusForCommentCommand)
export class PutLikeStatusForCommentUseCase
  implements ICommandHandler<PutLikeStatusForCommentCommand>
{
  constructor(
    private commentsQueryRepository: CommentsQueryRepository,
    private likesCommentRepository: LikesCommentRepository,
    private likesCommentQueryRepository: LikesCommentQueryRepository,
  ) {}

  async execute(command: PutLikeStatusForCommentCommand) {
    const commentIdNum = parseInt(command.id, 10);
    const userIdNum = parseInt(command.userId, 10);

    await this.commentsQueryRepository.getByIdOrNotFoundFail(commentIdNum);
    const currentLikeStatus =
      await this.likesCommentQueryRepository.getCurrentUserStatus(
        userIdNum,
        commentIdNum,
      );

    if (currentLikeStatus === command.likeStatus) {
      return;
    }

    if (!currentLikeStatus) {
      await this.likesCommentRepository.createLike(
        userIdNum,
        commentIdNum,
        command.likeStatus,
      );
    } else {
      await this.likesCommentRepository.updateLike(
        userIdNum,
        commentIdNum,
        command.likeStatus,
      );
    }
  }
}
