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

import { ApiParam } from '@nestjs/swagger';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view.dto';
import { PostsService } from '../application/posts.service';
import { PostsQueryRepository } from '../infactructure/query/posts.query-repository';
import { PostViewDto } from './view-dto/posts.view-dto';
import { GetPostsQueryParams } from './input-dto/get-posts-query-params.input-dto';
import { CreatePostInputDto } from './input-dto/posts.input-dto';
import { UpdatePostDto } from './input-dto/posts.update-input.dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreatePostCommand } from '../application/usecases/create-post-usecase';
import { UpdatePostCommand } from '../application/usecases/update-post-usecase';
import { DeletePostCommand } from '../application/usecases/delete-post-usecase';
import { ObjectIdValidationPipe } from '../../../../core/pipes/object-id-validation-pipe.service';
import { GetPostByIdQuery } from '../application/queries/get-post-by-id.query-handler';
import { GetPostsQuery } from '../application/queries/get-posts.query-handler';
import { BasicAuthGuard } from '../../../../modules/user-accounts/guards/basic/basic-auth.guard';

@Controller('posts')
export class PostsController {
  constructor(
     
    private postsQueryRepository: PostsQueryRepository,
    private commandBus: CommandBus,
    private queryBus: QueryBus
     ) {
    console.log('UsersController created');
  }

  @ApiParam({ name: 'id' }) //для сваггера
  @Get(':id') //users/232342-sdfssdf-23234323
  async getById(@Param('id') id: string): Promise<PostViewDto> {
    // можем и чаще так и делаем возвращать Promise из action. Сам NestJS будет дожидаться, когда
    // промис зарезолвится и затем NestJS вернёт результат клиенту
    return this.queryBus.execute(new GetPostByIdQuery(id));
  }

  @Get()
  async getAll(
    @Query() query: GetPostsQueryParams,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    return this.queryBus.execute(new GetPostsQuery(query));
  }

  @Post()
  @UseGuards(BasicAuthGuard)
  async createPost(@Body() body: CreatePostInputDto): Promise<PostViewDto> {
    const postId = await this.commandBus.execute(new CreatePostCommand(body))

    return this.postsQueryRepository.getByIdOrNotFoundFail(postId);
  }

  @Put(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(204)
  async updatePost(
    @Param('id') id: string,
    @Body() body: UpdatePostDto,
  ): Promise<void> {
    await this.commandBus.execute(new UpdatePostCommand(id, body));

    ;
  }

  @ApiParam({ name: 'id' }) //для сваггера
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BasicAuthGuard)
  async deleteBlog(@Param('id') id: string): Promise<void> {
    return this.commandBus.execute(new DeletePostCommand(id));
  }


}