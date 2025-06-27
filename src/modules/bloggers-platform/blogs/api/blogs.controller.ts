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

import { BlogViewDto } from './view-dto/blogs.view-dto';
import { CreateBlogInputDto } from './input-dto/blogs.input-dto';
import { ApiParam } from '@nestjs/swagger';
import { UpdateBlogInputDto } from './input-dto/update-blog.input-dto';
import { GetBlogsQueryParams} from './input-dto/get-blogs-query-params.input-dto';
import { PaginatedViewDto } from 'src/core/dto/base.paginated.view.dto';
import { BlogsService } from '../application/blogs.service';
import { BlogsQueryRepository } from '../infastructure/query/blogs.query-repository';

@Controller('blogs')
export class BlogsController {
  constructor(
    private blogsQueryRepository: BlogsQueryRepository,
    private blogsService: BlogsService,
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
    const userId = await this.blogsService.createBlog(body);

    return this.blogsQueryRepository.getByIdOrNotFoundFail(userId);
  }

  @Put(':id')
  async updateBlog(
    @Param('id') id: string,
    @Body() body: UpdateBlogInputDto,
  ): Promise<BlogViewDto> {
    const userId = await this.blogsService.updateBlog(id, body);

    return this.blogsQueryRepository.getByIdOrNotFoundFail(userId);
  }

  @ApiParam({ name: 'id' }) //для сваггера
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id') id: string): Promise<void> {
    return this.blogsService.deleteBlog(id);
  }
}