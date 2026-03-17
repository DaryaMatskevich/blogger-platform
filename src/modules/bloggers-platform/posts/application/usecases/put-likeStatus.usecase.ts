import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostLikesRepository } from '../../infactructure/likes/postLikesRepository';
import { PostsQueryRepository } from '../../../../../modules/bloggers-platform/posts/infactructure/query/posts.query-repository';
import { PostLikesQueryRepository } from '../../../../../modules/bloggers-platform/posts/infactructure/likes/postLikesQueryRepository';
import { LikeStatus } from '../../../../../modules/bloggers-platform/common/enums/like-status.enum';

export class PutLikeStatusForPostCommand {
  constructor(
    public postId: number,
    public userId: string,
    public likeStatus: LikeStatus,
  ) {}
}

@CommandHandler(PutLikeStatusForPostCommand)
export class putLikeStatusForPostUseCase
  implements ICommandHandler<PutLikeStatusForPostCommand>
{
  constructor(
    private postLikesRepository: PostLikesRepository,
    private postLikesQueryRepository: PostLikesQueryRepository,
    private postsQueryRepository: PostsQueryRepository,
  ) {}

  async execute(command: PutLikeStatusForPostCommand) {
    const { postId, userId, likeStatus } = command;
    const userIdNum = parseInt(userId, 10);

    await this.postsQueryRepository.getByIdWhithoutStatusOrNotFoundFail(postId);
    const currentLikeStatus =
      await this.postLikesQueryRepository.getCurrentUserStatus(
        userIdNum,
        postId,
      );

    if (currentLikeStatus === null && likeStatus === LikeStatus.None) {
      return;
    }

    if (currentLikeStatus === likeStatus) {
      return;
    }

    if (currentLikeStatus === null) {
      await this.postLikesRepository.createLike(userIdNum, postId, likeStatus);
    } else {
      await this.postLikesRepository.updateLike(userIdNum, postId, likeStatus);
    }
  }
}
