import { Injectable } from '@nestjs/common';
import { QuestionRepository } from '../../../../modules/sa/sa.quiz-questions/infrastructure/quiz-questions.repository';
import { CreateQuestionInputDto } from '../../../../modules/sa/sa.quiz-questions/api/dto/input/create-question.input-dto';
import { QuestionViewDto } from '../../../../modules/sa/sa.quiz-questions/api/dto/question.view-dto';
import { Question } from '../../../../modules/sa/sa.quiz-questions/domain/question.entity';
import { QuestionQueryRepository } from '../../../../modules/sa/sa.quiz-questions/infrastructure/query/question-query.repository';
import { DomainException } from '../../../../core/exeptions/domain-exeptions';
import { DomainExceptionCode } from '../../../../core/exeptions/domain-exeption-codes';

@Injectable()
export class SaQuizQuestionService {
  constructor(
    private readonly questionRepository: QuestionRepository,
    private readonly questionQueryRepository: QuestionQueryRepository,
  ) {}

  async createQuestion(dto: CreateQuestionInputDto): Promise<QuestionViewDto> {
    // 1. Создаем вопрос и получаем его ID
    const questionId = await this.questionRepository.createQuestion(dto);

    // 2. Отдельно запрашиваем созданный вопрос по ID
    const question =
      await this.questionQueryRepository.findQuestionById(questionId);
    if (!question) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Question not found',
      });
    }

    // 3. Маппим в DTO
    return this.mapToViewDto(question);
  }

  private mapToViewDto(question: Question): QuestionViewDto {
    return {
      id: question.id.toString(),
      body: question.body,
      correctAnswers: question.correctAnswers,
      published: question.published,
      createdAt: question.createdAt,
      updatedAt: question.updatedAt,
    };
  }
}
