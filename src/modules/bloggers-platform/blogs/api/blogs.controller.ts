import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';

import { BlogViewDto } from './view-dto/blogs.view-dto';
import { ApiParam } from '@nestjs/swagger';
import { GetBlogsQueryParams } from './input-dto/get-blogs-query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view.dto';
import { QueryBus } from '@nestjs/cqrs';
import { GetBlogsQuery } from '../application/queries/get-blogs.query-handler';
import { GetBlogByIdQuery } from '../application/queries/get-blog-by-id.query-handler';
import { GetPostsQueryParams } from '../../../../modules/bloggers-platform/posts/api/input-dto/get-posts-query-params.input-dto';
import { PostViewDto } from '../../../../modules/bloggers-platform/posts/api/view-dto/posts.view-dto';
import { GetPostsForBlogQuery } from '../../../../modules/bloggers-platform/posts/application/queries/get-posts-for-blog.query-handler';

@Controller('blogs')
export class BlogsController {
  constructor(private queryBus: QueryBus) {}

  @ApiParam({ name: 'id' }) //для сваггера
  @Get(':id')
  async getById(@Param('id') id: string): Promise<BlogViewDto> {
    return this.queryBus.execute(new GetBlogByIdQuery(id));
  }

  @Get()
  async getAll(
    @Query() query: GetBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogViewDto[]>> {
    return this.queryBus.execute(new GetBlogsQuery(query));
  }

  @ApiParam({ name: 'id' }) //для сваггера
  @Get(':id/posts')
  async getAllPostsForBlog(
    @Param('id', ParseIntPipe) blogId: number,
    @Query() query: GetPostsQueryParams,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    return this.queryBus.execute(new GetPostsForBlogQuery(query, blogId));
  }
}
