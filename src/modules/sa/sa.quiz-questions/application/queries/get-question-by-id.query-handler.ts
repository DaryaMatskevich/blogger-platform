import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { QuestionQueryRepository } from '../../../../../modules/sa/sa.quiz-questions/infrastructure/query/question-query.repository';
import { QuestionViewDto } from '../../../../../modules/sa/sa.quiz-questions/api/dto/question.view-dto';
import { NotFoundException } from '@nestjs/common';

export class GetQuestionByIdQuery {
  constructor(public readonly id: number) {}
}

@QueryHandler(GetQuestionByIdQuery)
export class GetQuestionByIdHandler
  implements IQueryHandler<GetQuestionByIdQuery, QuestionViewDto>
{
  constructor(
    private readonly questionQueryRepository: QuestionQueryRepository,
  ) {}

  async execute(query: GetQuestionByIdQuery): Promise<QuestionViewDto> {
    const question = await this.questionQueryRepository.findQuestionById(
      query.id,
    );
    if (!question) {
      throw new NotFoundException('Question not found');
    }
    return new QuestionViewDto(question);
  }
}
