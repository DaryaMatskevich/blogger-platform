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

import { ApiParam } from '@nestjs/swagger';
import { CommentViewDto } from './view-dto.ts/comments.view.dto';
import { CommentsQueryRepository } from '../infrastructute/query/comments.query-repository';
import { CommandBus } from '@nestjs/cqrs';
import { DeleteBlogCommand } from '../../blogs/application/usecases/delete-blog-usecase';
import { UpdateCommentDto } from '../domain/dto/update-comment.dto';
import { UpdateCommentCommand } from '../application/usecases/update-comment.usecase';
import { LikeInputModel } from '../domain/dto/like-status.dto';
import { ChangeLikeStatusCommand } from '../application/usecases/change-likeStatus.usecase';



@Controller('comments')
export class CommentsController {
  constructor(
    private commandBus: CommandBus,
    private commentsQueryRepository: CommentsQueryRepository
  ) {}

  @ApiParam({ name: 'id' }) //для сваггера
  @Get(':id') 
  async getById(@Param('id') id: string): Promise<CommentViewDto> {
    // можем и чаще так и делаем возвращать Promise из action. Сам NestJS будет дожидаться, когда
    // промис зарезолвится и затем NestJS вернёт результат клиенту
    return this.commentsQueryRepository.getByIdOrNotFoundFail(id);
  }

 @ApiParam({ name: 'id' }) //для сваггера
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id') id: string): Promise<void> {
    return this.commandBus.execute(new DeleteBlogCommand(id));
  }

  @Put(':id')
    @HttpCode(204)
    async updateComment(
      @Param('id') id: string,
      @Body() body: UpdateCommentDto,
    ): Promise<void> {
      await this.commandBus.execute(new UpdateCommentCommand(id, body));
      }

 @Put(':id')
    @HttpCode(204)
    async changeLikeStatus(
      @Param('id') id: string,
      @Body() body: LikeInputModel,
    ): Promise<void> {
      await this.commandBus.execute(new ChangeLikeStatusCommand(id, body.likeStatus));
      }


}