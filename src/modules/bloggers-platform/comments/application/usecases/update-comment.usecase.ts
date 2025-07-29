import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CommentsRepository } from "../../infrastructute/comments.repository";
import { UpdateCommentDto } from "../../domain/dto/update-comment.dto";

export class UpdateCommentCommand {
    constructor(public id: string,
        public dto: UpdateCommentDto) {}
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase
    implements ICommandHandler<UpdateCommentCommand> {
    constructor(
        private commentsRepository: CommentsRepository,
    ) { }


    async execute(command: UpdateCommentCommand): Promise<string> {
        const comment = await this.commentsRepository.findOrNotFoundFail(command.id);

        // не присваиваем св-ва сущностям напрямую в сервисах! даже для изменения одного св-ва
        // создаём метод
        comment.update(command.dto); // change detection

        await this.commentsRepository.save(comment);

        return comment._id.toString();
    }
}