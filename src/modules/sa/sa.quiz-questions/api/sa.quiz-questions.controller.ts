import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SaQuizQuestionService } from '../../../../modules/sa/sa.quiz-questions/application/sa.quiz-questions.service';
import { CreateQuestionInputDto } from '../../../../modules/sa/sa.quiz-questions/api/dto/input/create-question.input-dto';
import { QuestionViewDto } from '../../../../modules/sa/sa.quiz-questions/api/dto/question.view-dto';
import { QuestionsQueryDto } from './dto/query/questions.query-dto';
import { UpdateQuestionInputDto } from '../../../../modules/sa/sa.quiz-questions/api/dto/input/update-question.input-dto';
import { PublishQuestionInputDto } from '../../../../modules/sa/sa.quiz-questions/api/dto/input/publish-question.input-dto';
import { AdminBasicAuthGuard } from '../../../../modules/sa/guards/basic/admin-auth.guard';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { PublishQuestionCommand } from '../../../../modules/sa/sa.quiz-questions/application/usecaces/publish-question.usecase';
import { DeleteQuestionCommand } from '../../../../modules/sa/sa.quiz-questions/application/usecaces/delete-question.usecase';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view.dto';
import { GetQuestionsQuery } from '../../../../modules/sa/sa.quiz-questions/application/queries/get-questions.query-handler';
import { GetQuestionByIdQuery } from '../../../../modules/sa/sa.quiz-questions/application/queries/get-question-by-id.query-handler';
import { UpdateQuestionCommand } from '../../../../modules/sa/sa.quiz-questions/application/usecaces/update-question.usecase';

@Controller('sa/quiz/questions')
@UseGuards(AdminBasicAuthGuard)
export class SaQuizQuestionsController {
  constructor(
    private readonly saQuizQuestionService: SaQuizQuestionService,
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createQuestion(
    @Body() createQuestionDto: CreateQuestionInputDto,
  ): Promise<QuestionViewDto> {
    return this.saQuizQuestionService.createQuestion(createQuestionDto);
  }

  /**
   * Get all questions with pagination
   * GET /sa/quiz/questions
   */
  @Get()
  async getQuestions(
    @Query() query: QuestionsQueryDto,
  ): Promise<PaginatedViewDto<QuestionViewDto[]>> {
    return this.queryBus.execute(new GetQuestionsQuery(query));
  }

  /**
   * Get question by id
   * GET /sa/quiz/questions/:id
   */
  @Get(':id')
  async getQuestionById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<QuestionViewDto> {
    return this.queryBus.execute(new GetQuestionByIdQuery(id));
  }

  /**
   * Update question
   * PUT /sa/quiz/questions/:id
   */
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateQuestion(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateQuestionDto: UpdateQuestionInputDto,
  ): Promise<void> {
    await this.commandBus.execute(
      new UpdateQuestionCommand(id, updateQuestionDto),
    );
  }

  /**
   * Publish/unpublish question
   * PUT /sa/quiz/questions/:id/publish
   */
  @Put(':id/publish')
  @HttpCode(HttpStatus.NO_CONTENT)
  async publishQuestion(
    @Param('id', ParseIntPipe) id: number,
    @Body() publishDto: PublishQuestionInputDto,
  ): Promise<void> {
    await this.commandBus.execute(
      new PublishQuestionCommand(id, publishDto.published),
    );
  }

  /**
   * Delete question
   * DELETE /sa/quiz/questions/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteQuestion(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.commandBus.execute(new DeleteQuestionCommand(id));
  }
}
