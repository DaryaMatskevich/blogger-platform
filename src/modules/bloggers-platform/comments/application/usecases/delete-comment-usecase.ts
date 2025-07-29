import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CommentsRepository } from "../../infrastructute/comments.repository";


export class DeleteCommentCommand {
    constructor(public id: string,
    ) { }
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase
    implements ICommandHandler<DeleteCommentCommand> {
    constructor(
        private commentsRepository: CommentsRepository
    ) { }

    async execute(command: DeleteCommentCommand) {
        const comment = await this.commentsRepository.findOrNotFoundFail(command.id);

        comment.makeDeleted();

        await this.commentsRepository.save(comment);
    }
}
