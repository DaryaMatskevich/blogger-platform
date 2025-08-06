import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CommentsRepository } from "../../infrastructute/comments.repository";
import { DomainException } from "../../../../../core/exeptions/domain-exeptions";
import { DomainExceptionCode } from "../../../../../core/exeptions/domain-exeption-codes";


export class DeleteCommentCommand {
    constructor(public commentId: string,
        public userId: string,
    ) { }
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase
    implements ICommandHandler<DeleteCommentCommand> {
    constructor(
        private commentsRepository: CommentsRepository
    ) { }

    async execute(command: DeleteCommentCommand) {
        const comment = await this.commentsRepository.findOrNotFoundFail(command.commentId);
if(comment.commentatorInfo.userId !== command.userId) {
  throw new DomainException({
                code: DomainExceptionCode.Forbidden,
                message: "Forbidden",
              })
            }
        comment.makeDeleted();

        await this.commentsRepository.save(comment);
    }
}
