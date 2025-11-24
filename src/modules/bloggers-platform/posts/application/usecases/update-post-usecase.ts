import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdatePostDto } from '../../api/input-dto/posts.update-input.dto';
import { PostsQueryRepository } from '../../../../bloggers-platform/posts/infactructure/query/posts.query-repository';
import { PostsRepository } from '../../../../bloggers-platform/posts/infactructure/posts.repository';

export class UpdatePostCommand {
  constructor(
    public postId: string,
    public dto: UpdatePostDto,
  ) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<UpdatePostCommand> {
  constructor(
    private postsQueryRepository: PostsQueryRepository,
    private postsRepository: PostsRepository,
  ) {}

  async execute(command: UpdatePostCommand): Promise<void> {
    const postId = parseInt(command.postId, 10);
    await this.postsQueryRepository.getByIdOrNotFoundFail(postId);

    await this.postsRepository.update(postId, command.dto);
  }
}
