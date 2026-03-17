import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';

import { BlogViewDto } from '../../../bloggers-platform/blogs/api/view-dto/blogs.view-dto';
import { BlogInputDto } from './dto/blogs.input-dto';
import { ApiParam } from '@nestjs/swagger';
import { GetBlogsQueryParams } from '../../../bloggers-platform/blogs/api/input-dto/get-blogs-query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view.dto';
import { BlogsQueryRepository } from '../../../bloggers-platform/blogs/infastructure/query/blogs.query-repository';
import { PostViewDto } from '../../../bloggers-platform/posts/api/view-dto/posts.view-dto';
import { PostInputDto } from '../../../bloggers-platform/posts/api/input-dto/posts.input-dto';
import { PostsQueryRepository } from '../../../bloggers-platform/posts/infactructure/query/posts.query-repository';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateBlogCommand } from '../../../../modules/sa/sa.blogs/application/usecases/create-blog-usecase';
import { UpdateBlogCommand } from '../../../../modules/sa/sa.blogs/application/usecases/update-blog.usecase';
import { DeleteBlogCommand } from '../../../../modules/sa/sa.blogs/application/usecases/delete-blog-usecase';
import { CreatePostForBlogCommand } from '../../../bloggers-platform/posts/application/usecases/create-post-for-blog-usecase';
import { GetBlogsQuery } from '../../../bloggers-platform/blogs/application/queries/get-blogs.query-handler';
import { UpdatePostCommand } from '../../../bloggers-platform/posts/application/usecases/update-post-usecase';
import { DeletePostCommand } from '../../../bloggers-platform/posts/application/usecases/delete-post-usecase';
import { AdminBasicAuthGuard } from '../../guards/basic/admin-auth.guard';
import { GetPostsQueryParams } from '../../../bloggers-platform/posts/api/input-dto/get-posts-query-params.input-dto';
import { GetPostsForBlogQuery } from '../../../bloggers-platform/posts/application/queries/get-posts-for-blog.query-handler';

@UseGuards(AdminBasicAuthGuard)
@Controller('sa/blogs')
class SaBlogsController {
  constructor(
    private blogsQueryRepository: BlogsQueryRepository,
    private postsQueryRepository: PostsQueryRepository,
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  @Get()
  async getAll(
    @Query() query: GetBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogViewDto[]>> {
    return this.queryBus.execute(new GetBlogsQuery(query));
  }

  @Post()
  async createBlog(@Body() body: BlogInputDto): Promise<BlogViewDto> {
    const blogId = await this.commandBus.execute(new CreateBlogCommand(body));

    return this.blogsQueryRepository.getByIdOrNotFoundFail(blogId);
  }

  @Put(':id')
  @HttpCode(204)
  async updateBlog(
    @Param('id') id: string,
    @Body() body: BlogInputDto,
  ): Promise<void> {
    return this.commandBus.execute(new UpdateBlogCommand(id, body));
  }

  @ApiParam({ name: 'id' }) //для сваггера
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id') id: string): Promise<void> {
    return this.commandBus.execute(new DeleteBlogCommand(id));
  }

  @ApiParam({ name: 'id' }) //для сваггера
  @Get(':id/posts')
  async getAllPostsForBlog(
    @Param('id', ParseIntPipe) blogId: number,
    @Query() query: GetPostsQueryParams,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    return this.queryBus.execute(new GetPostsForBlogQuery(query, blogId));
  }
  @Post(':id/posts')
  async createPostForBlog(
    @Param('id', ParseIntPipe) blogId: number,
    @Body() body: PostInputDto,
  ): Promise<PostViewDto> {
    const postId = await this.commandBus.execute(
      new CreatePostForBlogCommand(blogId, body),
    );

    return this.postsQueryRepository.getByIdWhithoutStatusOrNotFoundFail(
      postId,
    );
  }

  @Put(':blogId/posts/:postId')
  @HttpCode(204)
  async updatePostForBlog(
    @Param('blogId') blogId: string,
    @Param('postId') postId: string,
    @Body() body: PostInputDto,
  ): Promise<void> {
    await this.commandBus.execute(new UpdatePostCommand(postId, blogId, body));
  }

  @ApiParam({ name: ':blogId/posts/:postId' }) //для сваггера
  @Delete(':blogId/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePostForBlog(
    @Param('blogId') blogId: string,
    @Param('postId') postId: string,
  ): Promise<void> {
    return this.commandBus.execute(new DeletePostCommand(postId, blogId));
  }
}

export default SaBlogsController;
