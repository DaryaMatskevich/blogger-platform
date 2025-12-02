import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateCommentInputDto } from '../../api/input-dto/comment.input-dto';
import { CommentsRepository } from '../../infrastructute/comments.repository';
import { UsersExternalQueryRepository } from '../.../../../../../../modules/user-accounts/infastructure/external-query/external-dto/users.external-query-repository';
import { DomainException } from '../../../../../core/exeptions/domain-exeptions';
import { DomainExceptionCode } from '../../../../../core/exeptions/domain-exeption-codes';
import { PostsQueryRepository } from '../../../../../modules/bloggers-platform/posts/infactructure/query/posts.query-repository';

export class CreateCommentForPostCommand {
  constructor(
    public postId: string,
    public userId: string,
    public dto: CreateCommentInputDto,
  ) {}
}

@CommandHandler(CreateCommentForPostCommand)
export class CreateCommentForPostUseCase
  implements ICommandHandler<CreateCommentForPostCommand>
{
  constructor(
    private commentsRepository: CommentsRepository,
    private usersExternalQueryRepository: UsersExternalQueryRepository,
    private postsQueryRepository: PostsQueryRepository,
  ) {}

  async execute(command: CreateCommentForPostCommand): Promise<string> {
    const postIdNum = parseInt(command.postId, 10);
    const userIdNum = parseInt(command.userId, 10);
    const postExist = await this.postsQueryRepository.existsById(postIdNum);

    if (!postExist) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Post not found',
      });
    }

    const user =
      await this.usersExternalQueryRepository.getByIdOrNotFoundFail(userIdNum);

    const commentDto = {
      content: command.dto.content,
      userId: userIdNum,
      userLogin: user.login,
      postId: postIdNum,
    };

    const comment = await this.commentsRepository.createComment(commentDto);

    return comment.id.toString();
  }
}
