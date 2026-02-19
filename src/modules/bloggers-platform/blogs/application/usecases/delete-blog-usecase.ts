import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../infastructure/blogs.repository';
import { BlogsQueryRepository } from '../../../blogs/infastructure/query/blogs.query-repository';
import { DomainException } from '../../../../../core/exeptions/domain-exeptions';
import { DomainExceptionCode } from '../../../../../core/exeptions/domain-exeption-codes';

export class DeleteBlogCommand {
  constructor(public id: string) {}
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase implements ICommandHandler<DeleteBlogCommand> {
  constructor(
    private blogsRepository: BlogsRepository,
    private blogsQueryRepository: BlogsQueryRepository,
  ) {}

  async execute(command: DeleteBlogCommand) {
    const blogIdNum = parseInt(command.id, 10);
    const blog = await this.blogsQueryRepository.findBlogById(blogIdNum);
    if (!blog) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Blog not found',
      });
    }

    const wasDeleted = await this.blogsRepository.delete(blogIdNum);
    if (!wasDeleted) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Blog deletion failed',
      });
    }
  }
}
