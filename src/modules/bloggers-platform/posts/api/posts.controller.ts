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
} from '@nestjs/common';

import { ApiParam } from '@nestjs/swagger';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view.dto';
import { PostsService } from '../application/posts.service';
import { PostsQueryRepository } from '../infactructure/query/posts.query-repository';
import { PostViewDto } from './view-dto/posts.view-dto';
import { GetPostsQueryParams } from './input-dto/get-posts-query-params.input-dto';
import { CreatePostInputDto } from './input-dto/posts.input-dto';
import { UpdatePostDto } from './input-dto/posts.update-input.dto';

@Controller('posts')
export class PostsController {
  constructor(
     private postsService: PostsService,
    private postsQueryRepository: PostsQueryRepository
     ) {
    console.log('UsersController created');
  }

  @ApiParam({ name: 'id' }) //для сваггера
  @Get(':id') //users/232342-sdfssdf-23234323
  async getById(@Param('id') id: string): Promise<PostViewDto> {
    // можем и чаще так и делаем возвращать Promise из action. Сам NestJS будет дожидаться, когда
    // промис зарезолвится и затем NestJS вернёт результат клиенту
    return this.postsQueryRepository.getByIdOrNotFoundFail(id);
  }

  @Get()
  async getAll(
    @Query() query: GetPostsQueryParams,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    return this.postsQueryRepository.getAll(query);
  }

  @Post()
  async createPost(@Body() body: CreatePostInputDto): Promise<PostViewDto> {
    const postId = await this.postsService.createPost(body);

    return this.postsQueryRepository.getByIdOrNotFoundFail(postId);
  }

  @Put(':id')
  async updatePost(
    @Param('id') id: string,
    @Body() body: UpdatePostDto,
  ): Promise<PostViewDto> {
    const postId = await this.postsService.updatePost(id, body);

    return this.postsQueryRepository.getByIdOrNotFoundFail(postId);
  }

  @ApiParam({ name: 'id' }) //для сваггера
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id') id: string): Promise<void> {
    return this.postsService.deletePost(id);
  }
}