import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CommentsRepository } from "../../infrastructute/comments.repository";


export class ChangeLikeStatusCommand {
    constructor(public id: string,
        public likeStatus: "Like" | "Dislike" | "None",
        
    ) { }
}

@CommandHandler(ChangeLikeStatusCommand)
export class ChangeLikeStatusUseCase
    implements ICommandHandler<ChangeLikeStatusCommand> {
    constructor(
        private commentsRepository: CommentsRepository
    ) { }

    async execute(command: ChangeLikeStatusCommand) {
        const comment = await this.commentsRepository.findOrNotFoundFail(command.id);

        comment.changeLikeStatus(command.likeStatus);

        await this.commentsRepository.save(comment);
    }
}
