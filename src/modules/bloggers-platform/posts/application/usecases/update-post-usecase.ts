import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdatePostDto } from '../../api/input-dto/posts.update-input.dto';
import { PostsQueryRepository } from '../../../../bloggers-platform/posts/infactructure/query/posts.query-repository';
import { PostsRepository } from '../../../../bloggers-platform/posts/infactructure/posts.repository';
import { DomainException } from '../../../../../core/exeptions/domain-exeptions';
import { DomainExceptionCode } from '../../../../../core/exeptions/domain-exeption-codes';
import { BlogsQueryRepository } from '../../../../bloggers-platform/blogs/infastructure/query/blogs.query-repository';

export class UpdatePostCommand {
  constructor(
    public postId: string,
    public blogId: string,
    public dto: UpdatePostDto,
  ) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<UpdatePostCommand> {
  constructor(
    private postsQueryRepository: PostsQueryRepository,
    private postsRepository: PostsRepository,
    private blogsQueryRepository: BlogsQueryRepository,
  ) {}

  async execute(command: UpdatePostCommand): Promise<void> {
    const postId = parseInt(command.postId, 10);
    const blogId = parseInt(command.blogId, 10);
    const blogExist = await this.blogsQueryRepository.blogExists(blogId);
    if (!blogExist) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Blog not found',
      });
    }
    const postExistsInBlog =
      await this.postsQueryRepository.existsByIdAndBlogId(postId, blogId);
    if (!postExistsInBlog) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Post not found',
      });
    }

    await this.postsRepository.update(postId, command.dto);
  }
}
