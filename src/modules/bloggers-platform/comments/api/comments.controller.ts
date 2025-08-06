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
import { CommentViewDto } from './view-dto/comments.view.dto';
import { CommentsQueryRepository } from '../infrastructute/query/comments.query-repository';
import { CommandBus } from '@nestjs/cqrs';
import { UpdateCommentDto } from '../domain/dto/update-comment.dto';
import { UpdateCommentCommand } from '../application/usecases/update-comment.usecase';
import { LikeInputModel } from '../domain/dto/like-status.dto';
import { JwtAuthGuard } from '../../../../modules/user-accounts/guards/bearer/jwt-auth.guard';
import { Public } from '../../../../modules/user-accounts/guards/decorators/public.decorator';
import { DeleteCommentCommand } from '../application/usecases/delete-comment-usecase';
import { PutLikeStatusForCommentCommand } from '../application/usecases/put-likeStatus.usecase';
import { ExtractUserFromRequest } from '../../../../modules/user-accounts/guards/decorators/param/extracr-user-from-request.decorator';
import { UserContextDto } from '../../../../modules/user-accounts/guards/dto/user-contex.dto';




@Controller('comments')
export class CommentsController {
  constructor(
    private commandBus: CommandBus,
    private commentsQueryRepository: CommentsQueryRepository
  ) { }

  @ApiParam({ name: 'id' }) //для сваггера
  @Get(':id')
  @Public()
  async getById(@Param('id') id: string): Promise<CommentViewDto> {
    // можем и чаще так и делаем возвращать Promise из action. Сам NestJS будет дожидаться, когда
    // промис зарезолвится и затем NestJS вернёт результат клиенту
    return this.commentsQueryRepository.getByIdOrNotFoundFail(id);
  }

  @ApiParam({ name: 'id' }) //для сваггера
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async deleteBlog(@Param('id') commentId: string,
  @ExtractUserFromRequest() user: UserContextDto,
): Promise<void> {
    return this.commandBus.execute(new DeleteCommentCommand(commentId, user.id));
  }

  @Put(':id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  async updateComment(
    @Param('id') commentId: string,
      @ExtractUserFromRequest() user: UserContextDto,
    @Body() body: UpdateCommentDto,
  ): Promise<void> {
    await this.commandBus.execute(new UpdateCommentCommand(commentId, user.id, body));
  }

  @Put(':id/like-status')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  async changeLikeStatus(
    @Param('id') id: string,
    @Body() body: LikeInputModel,
  ): Promise<void> {
    await this.commandBus.execute(new PutLikeStatusForCommentCommand(id, body.likeStatus));
  }


}