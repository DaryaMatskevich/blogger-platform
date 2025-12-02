import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../../infrastructute/comments.repository';
import { UpdateCommentDto } from '../../domain/dto/update-comment.dto';
import { DomainException } from '../../../../../core/exeptions/domain-exeptions';
import { DomainExceptionCode } from '../../../../../core/exeptions/domain-exeption-codes';
import { CommentsQueryRepository } from '../../../../../modules/bloggers-platform/comments/infrastructute/query/comments.query-repository';

export class UpdateCommentCommand {
  constructor(
    public commentId: string,
    public userId: string,
    public dto: UpdateCommentDto,
  ) {}
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase
  implements ICommandHandler<UpdateCommentCommand>
{
  constructor(
    private commentsRepository: CommentsRepository,
    private commentsQueryRepository: CommentsQueryRepository,
  ) {}

  async execute(command: UpdateCommentCommand): Promise<string> {
    const commentIdNum = parseInt(command.commentId, 10);
    const comment =
      await this.commentsQueryRepository.getByIdOrNotFoundFail(commentIdNum);
    if (comment.commentatorInfo.userId !== command.userId) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'Forbidden',
      });
    }

    await this.commentsRepository.update(commentIdNum, command.dto.content);

    return comment.id;
  }
}
