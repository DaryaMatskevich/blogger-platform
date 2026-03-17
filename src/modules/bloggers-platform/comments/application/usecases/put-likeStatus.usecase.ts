import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentLikesRepository } from '../../infrastructute/likes/commentLikesRepository';
import { CommentsQueryRepository } from '../../../../bloggers-platform/comments/infrastructute/query/comments.query-repository';
import { CommentLikesQueryRepository } from '../../infrastructute/likes/commentLikesQueryRepository';
import { LikeStatus } from '../../../../../modules/bloggers-platform/common/enums/like-status.enum';

export class PutLikeStatusForCommentCommand {
  constructor(
    public commentId: number,
    public userId: string,
    public likeStatus: LikeStatus,
  ) {}
}

@CommandHandler(PutLikeStatusForCommentCommand)
export class PutLikeStatusForCommentUseCase
  implements ICommandHandler<PutLikeStatusForCommentCommand>
{
  constructor(
    private commentsQueryRepository: CommentsQueryRepository,
    private commentLikesRepository: CommentLikesRepository,
    private commentLikesQueryRepository: CommentLikesQueryRepository,
  ) {}

  async execute(command: PutLikeStatusForCommentCommand) {
    const { commentId, userId, likeStatus } = command;
    const userIdNum = parseInt(userId, 10);

    await this.commentsQueryRepository.getByIdOrNotFoundFail(commentId);
    const currentLikeStatus =
      await this.commentLikesQueryRepository.getCurrentUserStatus(
        userIdNum,
        commentId,
      );

    // Статус не изменился
    if (currentLikeStatus === likeStatus) {
      return;
    }

    // Определяем действие
    if (currentLikeStatus === null) {
      // Нет записи
      if (likeStatus !== LikeStatus.None) {
        await this.commentLikesRepository.createLike(
          userIdNum,
          commentId,
          likeStatus,
        );
      }
      // Если 'None' - ничего не делаем (не создаем запись)
    } else {
      // Запись есть - всегда обновляем
      await this.commentLikesRepository.updateLike(
        userIdNum,
        commentId,
        likeStatus,
      );
      // Даже если command.likeStatus === 'None' - просто обновим
    }
  }
}
