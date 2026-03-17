import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view.dto';
import { GetPostsQueryParams } from '../../api/input-dto/get-posts-query-params.input-dto';
import { PostViewDto } from '../../api/view-dto/posts.view-dto';
import { PostsQueryRepository } from '../../infactructure/query/posts.query-repository';
import { DomainException } from '../../../../../core/exeptions/domain-exeptions';
import { DomainExceptionCode } from '../../../../../core/exeptions/domain-exeption-codes';
import { BlogsQueryRepository } from '../../../../../modules/bloggers-platform/blogs/infastructure/query/blogs.query-repository';

export class GetPostsForBlogQuery {
  constructor(
    public queryParams: GetPostsQueryParams,
    public blogId: number,
  ) {}
}

@QueryHandler(GetPostsForBlogQuery)
export class GetPostsForBlogQueryHandler
  implements
    IQueryHandler<GetPostsForBlogQuery, PaginatedViewDto<PostViewDto[]>>
{
  constructor(
    private readonly postsQueryRepository: PostsQueryRepository,
    private blogsQueryRepository: BlogsQueryRepository,
  ) {}

  async execute(
    query: GetPostsForBlogQuery,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    const { queryParams, blogId } = query;
    const blogExists = await this.blogsQueryRepository.blogExists(blogId);
    if (!blogExists) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Blog not found',
      });
    }
    return this.postsQueryRepository.getAllPostsForBlogWithPagination(
      queryParams,
      blogId,
    );
  }
}
