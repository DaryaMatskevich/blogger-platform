import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { PostsRepository } from "../../infactructure/posts.repository";


export class ChangeLikeStatusForPostCommand {
    constructor(public id: string,
        public likeStatus: "Like" | "Dislike" | "None",
        
    ) { }
}

@CommandHandler(ChangeLikeStatusForPostCommand)
export class ChangeLikeStatusForPostUseCase
    implements ICommandHandler<ChangeLikeStatusForPostCommand> {
    constructor(
        private postsRepository: PostsRepository
    ) { }

    async execute(command: ChangeLikeStatusForPostCommand) {
        const post = await this.postsRepository.findOrNotFoundFail(command.id);

        post.changeLikeStatus(command.likeStatus);

        await this.postsRepository.save(post);
    }
}
