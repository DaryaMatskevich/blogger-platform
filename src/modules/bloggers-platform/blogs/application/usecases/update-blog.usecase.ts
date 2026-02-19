import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateBlogDto } from '../../dto/update-blog.dto';
import { BlogsQueryRepository } from '../../../../../modules/bloggers-platform/blogs/infastructure/query/blogs.query-repository';
import { BlogsRepository } from '../../../../../modules/bloggers-platform/blogs/infastructure/blogs.repository';
import { DomainException } from '../../../../../core/exeptions/domain-exeptions';
import { DomainExceptionCode } from '../../../../../core/exeptions/domain-exeption-codes';

export class UpdateBlogCommand {
  constructor(
    public id: string,
    public dto: UpdateBlogDto,
  ) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase implements ICommandHandler<UpdateBlogCommand> {
  constructor(
    private blogsRepository: BlogsRepository,
    private blogsQueryRepository: BlogsQueryRepository,
  ) {}

  async execute(command: UpdateBlogCommand): Promise<void> {
    const blogIdNum = parseInt(command.id, 10);

    const blog = await this.blogsQueryRepository.findBlogById(blogIdNum);
    if (!blog) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Blog not found',
      });
    }

    const updateDto = {
      name: command.dto.name,
      description: command.dto.description,
      websiteUrl: command.dto.websiteUrl,
    };

    const wasUpdated = await this.blogsRepository.update(blogIdNum, updateDto);
    if (!wasUpdated) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Blog could not be updated',
      });
    }
  }
}
