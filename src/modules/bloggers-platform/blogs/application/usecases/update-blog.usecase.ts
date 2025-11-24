import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../infastructure/blogs.repository';
import { UpdateBlogDto } from '../../dto/update-blog.dto';

export class UpdateBlogCommand {
  constructor(
    public id: string,
    public dto: UpdateBlogDto,
  ) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase implements ICommandHandler<UpdateBlogCommand> {
  constructor(private blogsRepository: BlogsRepository) {}

  async execute(command: UpdateBlogCommand): Promise<void> {
    const blogId = parseInt(command.id, 10);

    await this.blogsRepository.findOrNotFoundFail(blogId);

    const updateDto = {
      name: command.dto.name,
      description: command.dto.description,
      websiteUrl: command.dto.websiteUrl,
    };

    await this.blogsRepository.update(blogId, updateDto);
  }
}
