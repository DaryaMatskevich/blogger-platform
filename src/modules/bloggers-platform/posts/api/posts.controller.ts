import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
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
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetPostByIdQuery } from '../application/queries/get-post-by-id.query-handler';
import { UserContextDto } from '../../../../modules/user-accounts/guards/dto/user-contex.dto';
import { CommentViewDto } from '../../comments/api/view-dto/comments.view.dto';
import { CreateCommentForPostCommand } from '../../comments/application/usecases/create-comment-for-post.usecase';
import { CommentsQueryRepository } from '../../comments/infrastructute/query/comments.query-repository';
import { LikeInputModel } from '../dto/like-status.dto';
import { JwtAuthGuard } from '../../../../modules/user-accounts/guards/bearer/jwt-auth.guard';
import { ExtractUserFromRequest } from '../../../../modules/user-accounts/guards/decorators/param/extracr-user-from-request.decorator';
import { CreateCommentInputDto } from '../../../../modules/bloggers-platform/comments/api/input-dto/comment.input-dto';
import { GetCommentsQueryParams } from '../../comments/api/input-dto/get-comments-query-params.input-dto';
import { DomainException } from '../../../../core/exeptions/domain-exeptions';
import { DomainExceptionCode } from '../../../../core/exeptions/domain-exeption-codes';
import { PutLikeStatusForPostCommand } from '../../../../modules/bloggers-platform/posts/application/usecases/put-likeStatus.usecase';
import { GetPostsQuery } from '../../../../modules/bloggers-platform/posts/application/queries/get-posts.query-handler';

@Controller('posts')
export class PostsController {
  constructor(
    private postsQueryRepository: PostsQueryRepository,
    private commandBus: CommandBus,
    private queryBus: QueryBus,
    private commentsQueryRepository: CommentsQueryRepository,
  ) {}

  @ApiParam({ name: 'id' }) //для сваггера
  @Get(':id')
  async getById(
    @Param('id', ParseIntPipe) postId: number,
  ): Promise<PostViewDto> {
    return this.queryBus.execute(new GetPostByIdQuery(postId));
  }

  @Get()
  async getAll(
    @Query() query: GetPostsQueryParams,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    return this.queryBus.execute(new GetPostsQuery(query));
  }

  @Post(':id/comments')
  @UseGuards(JwtAuthGuard)
  async createCommentForPost(
    @Param('id') postId: string,
    @ExtractUserFromRequest() user: UserContextDto,
    @Body() body: CreateCommentInputDto,
  ): Promise<CommentViewDto> {
    console.log(user);
    const commentId = await this.commandBus.execute(
      new CreateCommentForPostCommand(postId, user.id, body),
    );

    return this.commentsQueryRepository.getByIdOrNotFoundFail(commentId);
  }

  @Get(':id/comments')
  async getCommentsForPost(
    @Query() query: GetCommentsQueryParams,
    @Param('id', ParseIntPipe) postId: number,
  ): Promise<PaginatedViewDto<CommentViewDto[]>> {
    const postExists = await this.postsQueryRepository.existsById(postId);
    if (!postExists) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Post not found',
      });
    }
    return this.commentsQueryRepository.getCommentsForPost(query, postId);
  }

  @Put(':id/like-status')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  async putLikeStatusForPost(
    @Param('id', ParseIntPipe) postId: number,
    @ExtractUserFromRequest() user: UserContextDto,
    @Body() body: LikeInputModel,
  ): Promise<void> {
    await this.commandBus.execute(
      new PutLikeStatusForPostCommand(postId, user.id, body.likeStatus),
    );
  }
}
