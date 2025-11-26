import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../infactructure/posts.repository';
import { PostsQueryRepository } from '../../infactructure/query/posts.query-repository';

export class DeletePostCommand {
  constructor(public postId: string) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<DeletePostCommand> {
  constructor(
    private postsRepository: PostsRepository,
    private postsQueryRepository: PostsQueryRepository,
  ) {}

  async execute(command: DeletePostCommand) {
    const postId = parseInt(command.postId, 10);
    await this.postsQueryRepository.getByIdOrNotFoundFail(postId);
    await this.postsRepository.delete(postId);
  }
}
