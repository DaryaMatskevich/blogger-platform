import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Put,
  UseGuards,
} from '@nestjs/common';

import { ApiParam } from '@nestjs/swagger';
import { CommentViewDto } from './view-dto/comments.view.dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { UpdateCommentDto } from '../domain/dto/update-comment.dto';
import { UpdateCommentCommand } from '../application/usecases/update-comment.usecase';
import { LikeInputModel } from '../domain/dto/like-status.dto';
import { JwtAuthGuard } from '../../../../modules/user-accounts/guards/bearer/jwt-auth.guard';
import { DeleteCommentCommand } from '../application/usecases/delete-comment-usecase';
import { PutLikeStatusForCommentCommand } from '../application/usecases/put-likeStatus.usecase';
import { ExtractUserFromRequest } from '../../../../modules/user-accounts/guards/decorators/param/extracr-user-from-request.decorator';
import { UserContextDto } from '../../../../modules/user-accounts/guards/dto/user-contex.dto';
import { GetCommentByIdQuery } from '../application/queries/get-comment-by-id.query-handler';

@Controller('comments')
export class CommentsController {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  @ApiParam({ name: 'id' }) //для сваггера
  @Get(':id')
  async getById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CommentViewDto> {
    return this.queryBus.execute(new GetCommentByIdQuery(id));
  }

  @ApiParam({ name: 'id' }) //для сваггера
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async deleteComment(
    @Param('id') commentId: string,
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<void> {
    return this.commandBus.execute(
      new DeleteCommentCommand(commentId, user.id),
    );
  }

  @Put(':id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  async updateComment(
    @Param('id') commentId: string,
    @ExtractUserFromRequest() user: UserContextDto,
    @Body() body: UpdateCommentDto,
  ): Promise<void> {
    await this.commandBus.execute(
      new UpdateCommentCommand(commentId, user.id, body),
    );
  }

  @Put(':id/like-status')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  async changeLikeStatus(
    @Param('id', ParseIntPipe) id: number,
    @ExtractUserFromRequest() user: UserContextDto,
    @Body() body: LikeInputModel,
  ): Promise<void> {
    await this.commandBus.execute(
      new PutLikeStatusForCommentCommand(id, user.id, body.likeStatus),
    );
  }
}
