import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CommentsRepository } from "../../infrastructute/comments.repository";


export class PutLikeStatusForCommentCommand {
    constructor(public id: string,
        public likeStatus: string,
        
    ) { }
}

@CommandHandler(PutLikeStatusForCommentCommand)
export class PutLikeStatusForCommentUseCase
    implements ICommandHandler<PutLikeStatusForCommentCommand> {
    constructor(
        private commentsRepository: CommentsRepository
    ) { }

    async execute(command: PutLikeStatusForCommentCommand) {
        const comment = await this.commentsRepository.findOrNotFoundFail(command.id);

        comment.putLikeStatus(command.likeStatus);

        await this.commentsRepository.save(comment);
    }
}
