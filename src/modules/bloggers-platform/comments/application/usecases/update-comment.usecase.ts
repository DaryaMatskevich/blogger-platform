import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CommentsRepository } from "../../infrastructute/comments.repository";
import { UpdateCommentDto } from "../../domain/dto/update-comment.dto";
import { DomainException } from "../../../../../core/exeptions/domain-exeptions";
import { DomainExceptionCode } from "../../../../../core/exeptions/domain-exeption-codes";

export class UpdateCommentCommand {
    constructor(public commentId: string,
        public userId: string,
        public dto: UpdateCommentDto) {}
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase
    implements ICommandHandler<UpdateCommentCommand> {
    constructor(
        private commentsRepository: CommentsRepository,
    ) { }


    async execute(command: UpdateCommentCommand): Promise<string> {
        const comment = await this.commentsRepository.findOrNotFoundFail(command.commentId);
if(comment.commentatorInfo.userId !== command.userId) {
  throw new DomainException({
                code: DomainExceptionCode.Forbidden,
                message: "Forbidden",
              })
            }
        // не присваиваем св-ва сущностям напрямую в сервисах! даже для изменения одного св-ва
        // создаём метод
        comment.update(command.dto); // change detection

        await this.commentsRepository.save(comment);

        return comment._id.toString();
    }
}
