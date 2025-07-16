import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
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

@Controller('blogs')
export class BlogsController {
  constructor(
    private blogsService: BlogsService,
    private postsService: PostsService,
    private blogsQueryRepository: BlogsQueryRepository,
    private postsQueryRepository: PostsQueryRepository
  ) {
    console.log('UsersController created');
  }

  @ApiParam({ name: 'id' }) //для сваггера
  @Get(':id') //users/232342-sdfssdf-23234323
  async getById(@Param('id') id: string): Promise<BlogViewDto> {
    // можем и чаще так и делаем возвращать Promise из action. Сам NestJS будет дожидаться, когда
    // промис зарезолвится и затем NestJS вернёт результат клиенту
    return this.blogsQueryRepository.getByIdOrNotFoundFail(id);
  }

  @Get()
  async getAll(
    @Query() query: GetBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogViewDto[]>> {
    return this.blogsQueryRepository.getAll(query);
  }

  @Post()
  async createBlog(@Body() body: CreateBlogInputDto): Promise<BlogViewDto> {
    const blogId = await this.blogsService.createBlog(body);

    return this.blogsQueryRepository.getByIdOrNotFoundFail(blogId);
  }

  @Put(':id')
  @HttpCode(204)
  async updateBlog(
    @Param('id') id: string,
    @Body() body: UpdateBlogInputDto,
  ): Promise<void> {
    await this.blogsService.updateBlog(id, body);

  }

  @ApiParam({ name: 'id' }) //для сваггера
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id') id: string): Promise<void> {
    return this.blogsService.deleteBlog(id);
  }



  @ApiParam({ name: 'id' }) //для сваггера
  @Get(':id/posts')
  async getAllPostsForBlog(
    @Param('id') id: string,
    @Query() query: GetPostsQueryParams
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
const blogExists = await this.blogsService.blogExists(id)
 if (!blogExists) {
    throw new NotFoundException('Blog not found');
  }
  return this.blogsService.getAllPostsForBlog(id, query)
  }

  @Post(':id/posts')
  async createPostForBlog(
    @Param('id') blogId: string,
    @Body() body: CreatePostForBlogInputDto): Promise<PostViewDto> {
    const blogExists = await this.blogsService.blogExists(blogId)
 if (!blogExists) {
    throw new NotFoundException('Blog not found');
  }
      const postId = await this.postsService.createPostForBlog(blogId, body);

    return this.postsQueryRepository.getByIdOrNotFoundFail(postId);
  }
}