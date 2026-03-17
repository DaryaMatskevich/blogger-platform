import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view.dto';
import { QuestionsQueryDto } from '../../api/dto/query/questions.query-dto';
import { QuestionViewDto } from '../../api/dto/question.view-dto';
import { QuestionQueryRepository } from '../../infrastructure/query/question-query.repository';

export class GetQuestionsQuery {
  constructor(public queryParams: QuestionsQueryDto) {}
}

@QueryHandler(GetQuestionsQuery)
export class GetQuestionsQueryHandler
  implements
    IQueryHandler<GetQuestionsQuery, PaginatedViewDto<QuestionViewDto[]>>
{
  constructor(
    @Inject(QuestionQueryRepository)
    private readonly questionQueryRepository: QuestionQueryRepository,
  ) {}

  async execute(
    query: GetQuestionsQuery,
  ): Promise<PaginatedViewDto<QuestionViewDto[]>> {
    return this.questionQueryRepository.getAll(query.queryParams);
  }
}
