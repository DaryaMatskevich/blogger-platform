import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../infastructure/blogs.repository';
import { BlogInputDto } from '../../api/input-dto/blogs.input-dto';

export class CreateBlogCommand {
  constructor(public dto: BlogInputDto) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<CreateBlogCommand> {
  constructor(private blogsRepository: BlogsRepository) {}

  async execute(command: CreateBlogCommand): Promise<number> {
    const result = await this.blogsRepository.create({
      name: command.dto.name,
      description: command.dto.description,
      websiteUrl: command.dto.websiteUrl,
    });

    return result.id;
  }
}
