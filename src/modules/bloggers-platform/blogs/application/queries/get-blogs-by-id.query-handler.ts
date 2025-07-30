import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';

import { Types } from 'mongoose';
import { BlogViewDto } from '../../api/view-dto/blogs.view-dto';
import { BlogsQueryRepository } from '../../infastructure/query/blogs.query-repository';
import { BlogsRepository } from '../../infastructure/blogs.repository';
import { UsersExternalQueryRepository } from '@src/modules/user-accounts/infastructure/external-query/external-dto/users.external-query-repository';


export class GetBlogByIdQuery {
  constructor(
    public id: string,
  ) {}
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
   
    return this.blogsQueryRepository.getByIdOrNotFoundFail(query.id);
  }
}
