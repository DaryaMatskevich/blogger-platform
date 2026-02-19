import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsQueryRepository } from '../../../../../modules/bloggers-platform/blogs/infastructure/query/blogs.query-repository';
import { PostsRepository } from '../../infactructure/posts.repository';
import { PostInputDto } from '../../../../../modules/bloggers-platform/posts/api/input-dto/posts.input-dto';
import { DomainException } from '@src/core/exeptions/domain-exeptions';
import { DomainExceptionCode } from '@src/core/exeptions/domain-exeption-codes';

export class CreatePostForBlogCommand {
  constructor(
    public blogId: string,
    public dto: PostInputDto,
  ) {}
}

@CommandHandler(CreatePostForBlogCommand)
export class CreatePostForBlogUseCase
  implements ICommandHandler<CreatePostForBlogCommand>
{
  constructor(
    private blogsQueryRepository: BlogsQueryRepository,
    private postsRepository: PostsRepository,
  ) {}

  async execute(command: CreatePostForBlogCommand): Promise<number> {
    const blogIdNum = parseInt(command.blogId, 10);

    const blog = await this.blogsQueryRepository.blogExists(blogIdNum);
    if (!blog) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Blog not found',
      });
    }

    const result = await this.postsRepository.create({
      title: command.dto.title,
      shortDescription: command.dto.shortDescription,
      content: command.dto.content,
      blogId: blogIdNum,
    });

    return result.id;
  }
}
