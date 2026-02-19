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
import { CreatePostForBlogInputDto } from '../../posts/api/input-dto/posts.input-dto';
import { PostsQueryRepository } from '../../posts/infactructure/query/posts.query-repository';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateBlogCommand } from '../application/usecases/create-blog-usecase';
import { UpdateBlogCommand } from '../application/usecases/update-blog.usecase';
import { DeleteBlogCommand } from '../application/usecases/delete-blog-usecase';
import { CreatePostForBlogCommand } from '../../posts/application/usecases/create-post-for-blog-usecase';
import { GetBlogsQuery } from '../application/queries/get-blogs.query-handler';
import { GetBlogByIdQuery } from '../application/queries/get-blog-by-id.query-handler';
import { DomainException } from '../../../../core/exeptions/domain-exeptions';
import { DomainExceptionCode } from '../../../../core/exeptions/domain-exeption-codes';
import { JwtOptionalAuthGuard } from '../../../../modules/user-accounts/guards/bearer/jwt-optional-auth.guard';
import { UserContextDto } from '../../../../modules/user-accounts/guards/dto/user-contex.dto';
import { ExtractUserIfExistsFromRequest } from '../.././../../modules/user-accounts/guards/decorators/param/extract-user-if-exists-from-request.decorator';
import { AdminBasicAuthGuard } from '@src/modules/sa/guards/basic/admin-auth.guard';

@Controller('blogs')
export class BlogsController {
  constructor(
    private blogsQueryRepository: BlogsQueryRepository,
    private postsQueryRepository: PostsQueryRepository,
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

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

  @Post()
  @UseGuards(AdminBasicAuthGuard)
  async createBlog(@Body() body: BlogInputDto): Promise<BlogViewDto> {
    const blogId = await this.commandBus.execute(new CreateBlogCommand(body));

    return this.blogsQueryRepository.getByIdOrNotFoundFail(blogId);
  }

  @Put(':id')
  @HttpCode(204)
  @UseGuards(AdminBasicAuthGuard)
  async updateBlog(
    @Param('id') id: string,
    @Body() body: BlogInputDto,
  ): Promise<void> {
    return this.commandBus.execute(new UpdateBlogCommand(id, body));
  }

  @ApiParam({ name: 'id' }) //для сваггера
  @Delete(':id')
  @UseGuards(AdminBasicAuthGuard)
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
    const userId = user?.id || null;
    const blogIdNum = parseInt(blogId, 10);
    const blogExists = await this.blogsQueryRepository.blogExists(blogIdNum);
    if (!blogExists) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Blog not found',
      });
    }
    if (userId) {
      const userIdNum = parseInt(userId, 10);
      return this.postsQueryRepository.getPostsForBlogWithLikeStatus(
        query,
        blogIdNum,
        userIdNum,
      );
    } else {
      return this.postsQueryRepository.getPostsForBlogWithoutUserStatus(
        query,
        blogIdNum,
      );
    }
  }

  @Post(':id/posts')
  @UseGuards(AdminBasicAuthGuard)
  async createPostForBlog(
    @Param('id') blogId: string,
    @Body() body: CreatePostForBlogInputDto,
  ): Promise<PostViewDto> {
    const blogIdNum = parseInt(blogId, 10);
    const blogExists = await this.blogsQueryRepository.blogExists(blogIdNum);
    if (!blogExists) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Blog not found',
      });
    }
    const postId = await this.commandBus.execute(
      new CreatePostForBlogCommand(blogId, body),
    );

    return this.postsQueryRepository.getByIdOrNotFoundFail(postId);
  }
}
