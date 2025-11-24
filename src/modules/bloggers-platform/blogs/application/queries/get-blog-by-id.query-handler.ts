import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { BlogViewDto } from '../../api/view-dto/blogs.view-dto';
import { BlogsQueryRepository } from '../../infastructure/query/blogs.query-repository';

export class GetBlogByIdQuery {
  constructor(public id: string) {}
}

@QueryHandler(GetBlogByIdQuery)
export class GetBlogByIdQueryHandler
  implements IQueryHandler<GetBlogByIdQuery, BlogViewDto>
{
  constructor(
    @Inject(BlogsQueryRepository)
    private readonly blogsQueryRepository: BlogsQueryRepository,
  ) {}

  async execute(query: GetBlogByIdQuery): Promise<BlogViewDto> {
    const blogId = parseInt(query.id, 10);
    return this.blogsQueryRepository.getByIdOrNotFoundFail(blogId);
  }
}
