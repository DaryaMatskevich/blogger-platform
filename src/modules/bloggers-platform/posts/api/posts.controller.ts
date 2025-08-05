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
import { PostsQueryRepository } from '../infactructure/query/posts.query-repository';
import { PostViewDto } from './view-dto/posts.view-dto';
import { GetPostsQueryParams } from './input-dto/get-posts-query-params.input-dto';
import { CreatePostInputDto } from './input-dto/posts.input-dto';
import { UpdatePostDto } from './input-dto/posts.update-input.dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreatePostCommand } from '../application/usecases/create-post-usecase';
import { UpdatePostCommand } from '../application/usecases/update-post-usecase';
import { DeletePostCommand } from '../application/usecases/delete-post-usecase';
import { GetPostByIdQuery } from '../application/queries/get-post-by-id.query-handler';
import { GetPostsQuery } from '../application/queries/get-posts.query-handler';
import { BasicAuthGuard } from '../../../../modules/user-accounts/guards/basic/basic-auth.guard';
import { JwtAuthGuard } from '../../../../modules/user-accounts/guards/bearer/jwt-auth.guard';
import { CreateCommentInputDto } from '../../comments/api/input-dto/comment.input-dto';
import { ExtractUserFromRequest } from '../../../../modules/user-accounts/guards/decorators/param/extracr-user-from-request.decorator';
import { UserContextDto } from '../../../../modules/user-accounts/guards/dto/user-contex.dto';
import { CommentViewDto } from '../../comments/api/view-dto/comments.view.dto';
import { CreateCommentForPostCommand } from '../../comments/application/usecases/create-comment-for-post.usecase';
import { CommentsQueryRepository } from '../../comments/infrastructute/query/comments.query-repository';
import { LikeInputModel } from '../dto/like-status.dto';
import { ExtractUserIfExistsFromRequest } from '../../../../modules/user-accounts/guards/decorators/param/extract-user-if-exists-from-request.decorator';
import { PutLikeStatusForPostCommand } from '../application/usecases/put-likeStatus.usecase';
import { JwtOptionalAuthGuard } from '../../../../modules/user-accounts/guards/bearer/jwt-optional-auth.guard';

@Controller('posts')
export class PostsController {
  constructor(

    private postsQueryRepository: PostsQueryRepository,
    private commandBus: CommandBus,
    private queryBus: QueryBus,
    private commentsQueryRepository: CommentsQueryRepository
  ) {
    console.log('UsersController created');
  }

  @ApiParam({ name: 'id' }) //для сваггера
  @Get(':id') //users/232342-sdfssdf-23234323
  @UseGuards(JwtOptionalAuthGuard)
  async getById(
    @ExtractUserIfExistsFromRequest() user: UserContextDto | null,
    @Param('id') postId: string)
    : Promise<PostViewDto> {
    const userId = user?.id || null;
    console.log(userId)
    return this.queryBus.execute(new GetPostByIdQuery(postId, userId));
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
  async deletePost(@Param('id') id: string): Promise<void> {
    return this.commandBus.execute(new DeletePostCommand(id));
  }


  @Post(':id/comments')
  @UseGuards(JwtAuthGuard)
  async createCommentForPost(
    @Param('id') postId: string,
    @ExtractUserFromRequest() user: UserContextDto,
    @Body() body: CreateCommentInputDto,
  ): Promise<CommentViewDto> {
    console.log(user)
    const commentId = await this.commandBus.execute(new CreateCommentForPostCommand(postId, user.id, body));

    return this.commentsQueryRepository.getByIdOrNotFoundFail(commentId);
  }

  @Put(':id/like-status')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  async putLikeStatusForPost(
    @Param('id') postId: string,
    @ExtractUserFromRequest() user: UserContextDto,
    @Body() body: LikeInputModel,
  ): Promise<void> {
    await this.commandBus.execute(new PutLikeStatusForPostCommand(postId, user.id, body.likeStatus));
  }



}