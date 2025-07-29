import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { PostsRepository } from "../../infactructure/posts.repository";

export class DeletePostCommand {
  constructor(public postId: string,
  ) { }
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase
  implements ICommandHandler<DeletePostCommand> {
  constructor(
    private postsRepository: PostsRepository,
  ) { }

async execute(command: DeletePostCommand) {
      const post = await this.postsRepository.findOrNotFoundFail(command.postId);
  
      post.makeDeleted();
  
      await this.postsRepository.save(post);
    }
}