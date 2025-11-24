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
import { CreateBlogInputDto } from './input-dto/blogs.input-dto';
import { ApiParam } from '@nestjs/swagger';
import { UpdateBlogInputDto } from './input-dto/update-blog.input-dto';
import { GetBlogsQueryParams } from './input-dto/get-blogs-query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view.dto';
import { BlogsService } from '../application/blogs.service';
import { BlogsQueryRepository } from '../infastructure/query/blogs.query-repository';
import { GetPostsQueryParams } from '../../posts/api/input-dto/get-posts-query-params.input-dto';
import { PostViewDto } from '../../posts/api/view-dto/posts.view-dto';
import { CreatePostForBlogInputDto } from '../../posts/api/input-dto/posts.input-dto';
import { PostsService } from '../../posts/application/posts.service';
import { PostsQueryRepository } from '../../posts/infactructure/query/posts.query-repository';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateBlogCommand } from '../application/usecases/create-blog-usecase';
import { UpdateBlogCommand } from '../application/usecases/update-blog.usecase';
import { DeleteBlogCommand } from '../application/usecases/delete-blog-usecase';
import { CreatePostForBlogCommand } from '../../posts/application/usecases/create-post-for-blog-usecase';
import { BasicAuthGuard } from '../../../../modules/user-accounts/guards/basic/basic-auth.guard';
import { GetBlogsQuery } from '../application/queries/get-blogs.query-handler';
import { DomainException } from '../../../../core/exeptions/domain-exeptions';
import { DomainExceptionCode } from '../../../../core/exeptions/domain-exeption-codes';
import { JwtOptionalAuthGuard } from '../../../../modules/user-accounts/guards/bearer/jwt-optional-auth.guard';
import { UserContextDto } from '../../../../modules/user-accounts/guards/dto/user-contex.dto';
import { ExtractUserIfExistsFromRequest } from '../../../../modules/user-accounts/guards/decorators/param/extract-user-if-exists-from-request.decorator';
import { UpdatePostDto } from '../../../../modules/bloggers-platform/posts/api/input-dto/posts.update-input.dto';
import { UpdatePostCommand } from '../../../../modules/bloggers-platform/posts/application/usecases/update-post-usecase';
import { DeletePostCommand } from '../../../../modules/bloggers-platform/posts/application/usecases/delete-post-usecase';
import { SaGuard } from '../../../../sa/sa.guard';

@UseGuards(SaGuard)
@Controller('sa/blogs')
export class SaBlogsController {
  constructor(
    private blogsService: BlogsService,
    private postsService: PostsService,
    private blogsQueryRepository: BlogsQueryRepository,
    private postsQueryRepository: PostsQueryRepository,
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {
    console.log('UsersController created');
  }

  @Get()
  async getAll(
    @Query() query: GetBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogViewDto[]>> {
    return this.queryBus.execute(new GetBlogsQuery(query));
  }

  @Post()
  @UseGuards(BasicAuthGuard)
  async createBlog(@Body() body: CreateBlogInputDto): Promise<BlogViewDto> {
    const blogId = await this.commandBus.execute(new CreateBlogCommand(body));

    return this.blogsQueryRepository.getByIdOrNotFoundFail(blogId);
  }

  @Put(':id')
  @HttpCode(204)
  @UseGuards(BasicAuthGuard)
  async updateBlog(
    @Param('id') id: string,
    @Body() body: UpdateBlogInputDto,
  ): Promise<void> {
    await this.commandBus.execute(new UpdateBlogCommand(id, body));
  }

  @ApiParam({ name: 'id' }) //для сваггера
  @Delete(':id')
  @UseGuards(BasicAuthGuard)
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
    const blogExists = await this.blogsQueryRepository.blogExists(blogId);
    if (!blogExists) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Blog not found',
      });
    }
    return this.blogsService.getAllPostsForBlog(blogId, userId, query);
  }

  @Post(':id/posts')
  @UseGuards(BasicAuthGuard)
  async createPostForBlog(
    @Param('id') blogId: string,
    @Body() body: CreatePostForBlogInputDto,
  ): Promise<PostViewDto> {
    const blogExists = await this.blogsQueryRepository.blogExists(blogId);
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

  @Put(':id')
  @HttpCode(204)
  @UseGuards(BasicAuthGuard)
  async updatePostForBlog(
    @Param('id') id: string,
    @Body() body: UpdatePostDto,
  ): Promise<void> {
    await this.commandBus.execute(new UpdatePostCommand(id, body));
  }

  @ApiParam({ name: 'id' }) //для сваггера
  @Delete(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePostForBlog(@Param('id') id: string): Promise<void> {
    return this.commandBus.execute(new DeletePostCommand(id));
  }
}
