import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetBlogsQueryParams } from '../../api/input-dto/get-blogs-query-params.input-dto';
import { BlogViewDto } from '../../api/view-dto/blogs.view-dto';
import { BlogsQueryRepository } from '../../infastructure/query/blogs.query-repository';
import { PaginatedViewDto } from '@src/core/dto/base.paginated.view.dto';


export class GetBlogsQuery {
  constructor(public queryParams: GetBlogsQueryParams) {}
}

@QueryHandler(GetBlogsQuery)
export class GetBlogsQueryHandler
  implements IQueryHandler<GetBlogsQuery, PaginatedViewDto<BlogViewDto[]>>
{
  constructor(
    @Inject(BlogsQueryRepository)
    private readonly blogsQueryRepository: BlogsQueryRepository,
  ) {}

  async execute(
    query: GetBlogsQuery,
  ): Promise<PaginatedViewDto<BlogViewDto[]>> {
    return this.blogsQueryRepository.getAll(query.queryParams);
  }
}