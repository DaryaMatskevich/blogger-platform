import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../infastructure/blogs.repository';
import { CreateBlogInputDto } from '../../api/input-dto/blogs.input-dto';

export class CreateBlogCommand {
  constructor(public dto: CreateBlogInputDto) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<CreateBlogCommand> {
  constructor(private blogsRepository: BlogsRepository) {}

  async execute(command: CreateBlogCommand): Promise<number> {
    const blog = await this.blogsRepository.create({
      name: command.dto.name,
      description: command.dto.description,
      websiteUrl: command.dto.websiteUrl,
    });

    return blog.id;
  }
}
