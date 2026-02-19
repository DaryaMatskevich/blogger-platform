import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';

import { BlogViewDto } from './view-dto/blogs.view-dto';
import { BlogInputDto } from './input-dto/blogs.input-dto';
import { ApiParam } from '@nestjs/swagger';
import { GetBlogsQueryParams } from './input-dto/get-blogs-query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view.dto';
import { BlogsQueryRepository } from '../infastructure/query/blogs.query-repository';
import { GetPostsQueryParams } from '../../posts/api/input-dto/get-posts-query-params.input-dto';
import { PostViewDto } from '../../posts/api/view-dto/posts.view-dto';
import { PostInputDto } from '../../posts/api/input-dto/posts.input-dto';
import { PostsQueryRepository } from '../../posts/infactructure/query/posts.query-repository';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateBlogCommand } from '../application/usecases/create-blog-usecase';
import { UpdateBlogCommand } from '../application/usecases/update-blog.usecase';
import { DeleteBlogCommand } from '../application/usecases/delete-blog-usecase';
import { CreatePostForBlogCommand } from '../../posts/application/usecases/create-post-for-blog-usecase';
import { AdminAuthGuard } from '@src/modules/sa/guards/basic/admin-auth.guard';
import { GetBlogsQuery } from '../application/queries/get-blogs.query-handler';
import { DomainException } from '../../../../core/exeptions/domain-exeptions';
import { DomainExceptionCode } from '../../../../core/exeptions/domain-exeption-codes';
import { JwtOptionalAuthGuard } from '../../../../modules/user-accounts/guards/bearer/jwt-optional-auth.guard';
import { UserContextDto } from '../../../../modules/user-accounts/guards/dto/user-contex.dto';
import { ExtractUserIfExistsFromRequest } from '../../../../modules/user-accounts/guards/decorators/param/extract-user-if-exists-from-request.decorator';
import { UpdatePostCommand } from '../../../../modules/bloggers-platform/posts/application/usecases/update-post-usecase';
import { DeletePostCommand } from '../../../../modules/bloggers-platform/posts/application/usecases/delete-post-usecase';
import { SaGuard } from '@src/modules/sa/sa.guard';

@UseGuards(SaGuard)
@Controller('sa/blogs')
export class SaBlogsController {
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
  @UseGuards(AdminAuthGuard)
  async createBlog(@Body() body: BlogInputDto): Promise<BlogViewDto> {
    const blogId = await this.commandBus.execute(new CreateBlogCommand(body));

    return this.blogsQueryRepository.getByIdOrNotFoundFail(blogId);
  }

  @Put(':id')
  @HttpCode(204)
  @UseGuards(AdminAuthGuard)
  async updateBlog(
    @Param('id') id: string,
    @Body() body: BlogInputDto,
  ): Promise<void> {
    return this.commandBus.execute(new UpdateBlogCommand(id, body));
  }

  @ApiParam({ name: 'id' }) //для сваггера
  @Delete(':id')
  @UseGuards(AdminAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id') id: string): Promise<void> {
    return this.commandBus.execute(new DeleteBlogCommand(id));
  }

  @ApiParam({ name: 'id' }) //для сваггера
  @Get(':id/posts')
  @UseGuards(JwtOptionalAuthGuard)
  async getAllPostsForBlog(
    @Param('id') blogId: string,
    @ExtractUserIfExistsFromRequest() user: UserContextDto | null,
    @Query() query: GetPostsQueryParams,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    const blogIdNum = parseInt(blogId, 10);
    const blogExists = await this.blogsQueryRepository.blogExists(blogIdNum);
    if (!blogExists) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Blog not found',
      });
    }
    return this.postsQueryRepository.getPostsForBlogWithoutUserStatus(
      query,
      blogIdNum,
    );
  }

  @Post(':id/posts')
  @UseGuards(AdminAuthGuard)
  async createPostForBlog(
    @Param('id') blogId: string,
    @Body() body: PostInputDto,
  ): Promise<PostViewDto> {
    const postId = await this.commandBus.execute(
      new CreatePostForBlogCommand(blogId, body),
    );

    return this.postsQueryRepository.getByIdOrNotFoundFail(postId);
  }

  @Put(':blogId/posts/:postId')
  @HttpCode(204)
  @UseGuards(AdminAuthGuard)
  async updatePostForBlog(
    @Param('blogId') blogId: string,
    @Param('postId') postId: string,
    @Body() body: PostInputDto,
  ): Promise<void> {
    await this.commandBus.execute(new UpdatePostCommand(postId, blogId, body));
  }

  @ApiParam({ name: ':blogId/posts/:postId' }) //для сваггера
  @Delete(':blogId/posts/:postId')
  @UseGuards(AdminAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePostForBlog(
    @Param('blogId') blogId: string,
    @Param('postId') postId: string,
  ): Promise<void> {
    return this.commandBus.execute(new DeletePostCommand(postId, blogId));
  }
}
