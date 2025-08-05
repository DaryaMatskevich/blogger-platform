import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { PostsRepository } from "../../infactructure/posts.repository";
import { LikesPostRepository } from "../../infactructure/likes/likesPostRepository";
import { LikePost, LikePostModelType } from "../../domain/likes/like.entity";
import { InjectModel } from "@nestjs/mongoose";
import { UsersExternalQueryRepository } from "../../../../../modules/user-accounts/infastructure/external-query/external-dto/users.external-query-repository";


export class PutLikeStatusForPostCommand {
    constructor(public postId: string,
        public userId: string,
        public likeStatus: string

    ) { }
}

@CommandHandler(PutLikeStatusForPostCommand)
export class putLikeStatusForPostUseCase
    implements ICommandHandler<PutLikeStatusForPostCommand> {
    constructor(
        @InjectModel(LikePost.name)
        private LikePostModel: LikePostModelType,

        private postsRepository: PostsRepository,
        private likesPostRepository: LikesPostRepository,
        private usersExternalQueryRepository: UsersExternalQueryRepository
    ) { }

    async execute(command: PutLikeStatusForPostCommand) {
        const post = await this.postsRepository.findOrNotFoundFail(command.postId);

        const currentLikePost = await this.likesPostRepository.getLikePostByUserId(command.userId, command.postId)
        const oldStatus = currentLikePost?.status || "None";
        if (oldStatus === command.likeStatus) {
            return;
        }

        if (!currentLikePost) {
            const user = await this.usersExternalQueryRepository.getByIdOrNotFoundFail(command.userId)
            const likePost = this.LikePostModel.createLikePost(
                command.userId,
                user.login,
                command.likeStatus,
                command.postId
            )
            await this.likesPostRepository.save(likePost)
        }
        else {
            currentLikePost.updateStatus(command.likeStatus)
            await this.likesPostRepository.save(currentLikePost)
            console.log(currentLikePost)
        }
       const user = await this.usersExternalQueryRepository.getByIdOrNotFoundFail(command.userId)
 post.changeLikesCounter(
            oldStatus,
            command.likeStatus,
            command.userId,
            user.login,
            
        );
        // Сохраняем изменения поста
        await this.postsRepository.save(post);
    }
}

