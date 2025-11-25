import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsQueryRepository } from '../../../../../modules/bloggers-platform/blogs/infastructure/query/blogs.query-repository';
import { CreatePostForBlogInputDto } from '../../api/input-dto/posts.input-dto';
import { PostsRepository } from '../../infactructure/posts.repository';

export class CreatePostForBlogCommand {
  constructor(
    public blogId: string,
    public dto: CreatePostForBlogInputDto,
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
    const blogId = parseInt(command.blogId, 10);

    const blog = await this.blogsQueryRepository.getByIdOrNotFoundFail(blogId);

    const post = await this.postsRepository.create({
      title: command.dto.title,
      shortDescription: command.dto.shortDescription,
      content: command.dto.content,
      blogId: blogId,
      blogName: blog.name,
    });

    return post.id;
  }
}
