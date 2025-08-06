import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CommentsRepository } from "../../infrastructute/comments.repository";
import { LikesCommentRepository } from "../../infrastructute/likes/likesCommentRepository";
import { InjectModel } from "@nestjs/mongoose";
import { LikeComment, LikeCommentModelType } from "../../domain/likes/like.entity";


export class PutLikeStatusForCommentCommand {
    constructor(public id: string,
        public userId: string,
        public likeStatus: string,

    ) { }
}

@CommandHandler(PutLikeStatusForCommentCommand)
export class PutLikeStatusForCommentUseCase
    implements ICommandHandler<PutLikeStatusForCommentCommand> {
    constructor(
        @InjectModel(LikeComment.name)
        private LikeCommentModel: LikeCommentModelType,
        private commentsRepository: CommentsRepository,
        private likesCommentRepository: LikesCommentRepository
    ) { }

    async execute(command: PutLikeStatusForCommentCommand) {
        const comment = await this.commentsRepository.findOrNotFoundFail(command.id);
        const currentLikeComment = await this.likesCommentRepository.getLikeCommentByUserId(command.userId, command.id)
        const oldLikeStatus = currentLikeComment?.status || "None"
        if (oldLikeStatus === command.likeStatus) {
            return;
        }

        if (!currentLikeComment) {

            const likeComment = this.LikeCommentModel.createLikeComment(
                command.userId,
                command.likeStatus,
                command.id
            )
            await this.likesCommentRepository.save(likeComment)
        }
        else {
            currentLikeComment.updateStatus(command.likeStatus)
            await this.likesCommentRepository.save(currentLikeComment)
            console.log(currentLikeComment)
        }
       
        comment.changeLikesCounter(
            oldLikeStatus,
            command.likeStatus,
            
        );
        // Сохраняем изменения поста

        await this.commentsRepository.save(comment);
    }
}
