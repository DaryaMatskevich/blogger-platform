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



@Controller('comments')
export class CommentsController {
  constructor(
    private commentsQueryRepository: CommentsQueryRepository
  ) {
    console.log('CommentsController created');
  }

  @ApiParam({ name: 'id' }) //для сваггера
  @Get(':id') 
  async getById(@Param('id') id: string): Promise<CommentViewDto> {
    // можем и чаще так и делаем возвращать Promise из action. Сам NestJS будет дожидаться, когда
    // промис зарезолвится и затем NestJS вернёт результат клиенту
    return this.commentsQueryRepository.getByIdOrNotFoundFail(id);
  }

}