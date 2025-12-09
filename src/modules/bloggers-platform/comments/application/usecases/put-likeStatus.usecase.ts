import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentLikesRepository } from '../../infrastructute/likes/commentLikesRepository';
import { CommentsQueryRepository } from '../../../../bloggers-platform/comments/infrastructute/query/comments.query-repository';
import { CommentLikesQueryRepository } from '../../infrastructute/likes/commentLikesQueryRepository';

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
    private commentLikesRepository: CommentLikesRepository,
    private commentLikesQueryRepository: CommentLikesQueryRepository,
  ) {}

  async execute(command: PutLikeStatusForCommentCommand) {
    const commentIdNum = parseInt(command.id, 10);
    const userIdNum = parseInt(command.userId, 10);

    await this.commentsQueryRepository.getByIdOrNotFoundFail(commentIdNum);
    const currentLikeStatus =
      await this.commentLikesQueryRepository.getCurrentUserStatus(
        userIdNum,
        commentIdNum,
      );

    // Статус не изменился
    if (currentLikeStatus === command.likeStatus) {
      return;
    }

    // Определяем действие
    if (currentLikeStatus === null) {
      // Нет записи
      if (command.likeStatus !== 'None') {
        await this.commentLikesRepository.createLike(
          userIdNum,
          commentIdNum,
          command.likeStatus,
        );
      }
      // Если 'None' - ничего не делаем (не создаем запись)
    } else {
      // Запись есть - всегда обновляем
      await this.commentLikesRepository.updateLike(
        userIdNum,
        commentIdNum,
        command.likeStatus,
      );
      // Даже если command.likeStatus === 'None' - просто обновим
    }
  }
}
