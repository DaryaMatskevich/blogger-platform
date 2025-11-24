import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../infastructure/blogs.repository';

export class DeleteBlogCommand {
  constructor(public id: string) {}
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase implements ICommandHandler<DeleteBlogCommand> {
  constructor(private blogsRepository: BlogsRepository) {}

  async execute(command: DeleteBlogCommand) {
    const blogId = parseInt(command.id, 10);

    await this.blogsRepository.findOrNotFoundFail(blogId);
    await this.blogsRepository.delete(blogId);
  }
}
