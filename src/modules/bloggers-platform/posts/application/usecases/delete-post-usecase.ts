import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../infactructure/posts.repository';
import { PostsQueryRepository } from '../../infactructure/query/posts.query-repository';
import { BlogsQueryRepository } from '../../../blogs/infastructure/query/blogs.query-repository';
import { DomainException } from '../../../../../core/exeptions/domain-exeptions';
import { DomainExceptionCode } from '../../../../../core/exeptions/domain-exeption-codes';

export class DeletePostCommand {
  constructor(
    public postId: string,
    public blogId: string,
  ) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<DeletePostCommand> {
  constructor(
    private postsRepository: PostsRepository,
    private postsQueryRepository: PostsQueryRepository,
    private blogsQueryRepository: BlogsQueryRepository,
  ) {}

  async execute(command: DeletePostCommand) {
    const postId = parseInt(command.postId, 10);
    const blogExist = await this.blogsQueryRepository.blogExists(
      command.blogId,
    );
    if (!blogExist) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Blog not found',
      });
    }
    await this.postsQueryRepository.getByIdOrNotFoundFail(postId);
    await this.postsRepository.delete(postId);
  }
}
