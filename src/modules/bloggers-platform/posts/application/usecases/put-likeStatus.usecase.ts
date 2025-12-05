import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostLikesRepository } from '../../infactructure/likes/postLikesRepository';
import { UsersExternalQueryRepository } from '../../../../../modules/user-accounts/infastructure/external-query/external-dto/users.external-query-repository';
import { PostsQueryRepository } from '../../../../../modules/bloggers-platform/posts/infactructure/query/posts.query-repository';
import { PostLikesQueryRepository } from '../../../../../modules/bloggers-platform/posts/infactructure/likes/postLikesQueryRepository';

export class PutLikeStatusForPostCommand {
  constructor(
    public postId: string,
    public userId: string,
    public likeStatus: 'Like' | 'Dislike' | 'None',
  ) {}
}

@CommandHandler(PutLikeStatusForPostCommand)
export class putLikeStatusForPostUseCase
  implements ICommandHandler<PutLikeStatusForPostCommand>
{
  constructor(
    private postLikesRepository: PostLikesRepository,
    private postLikesQueryRepository: PostLikesQueryRepository,
    private usersExternalQueryRepository: UsersExternalQueryRepository,
    private postsQueryRepository: PostsQueryRepository,
  ) {}

  async execute(command: PutLikeStatusForPostCommand) {
    const postIdNum = parseInt(command.postId, 10);
    const userIdNum = parseInt(command.userId, 10);

    await this.postsQueryRepository.getByIdOrNotFoundFail(postIdNum);
    const currentLikeStatus =
      await this.postLikesQueryRepository.getCurrentUserStatus(
        userIdNum,
        postIdNum,
      );

    if (currentLikeStatus === null && command.likeStatus === 'None') {
      return;
    }

    if (currentLikeStatus === command.likeStatus) {
      return;
    }

    if (currentLikeStatus === null) {
      await this.postLikesRepository.createLike(
        userIdNum,
        postIdNum,
        command.likeStatus,
      );
    } else {
      await this.postLikesRepository.updateLike(
        userIdNum,
        postIdNum,
        command.likeStatus,
      );
    }
  }
}
