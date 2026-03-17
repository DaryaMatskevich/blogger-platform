import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Question } from '../../../../../modules/sa/sa.quiz-questions/domain/question.entity';
import { QuestionsQueryDto } from '../../api/dto/query/questions.query-dto';
import { QuestionViewDto } from '../../../../../modules/sa/sa.quiz-questions/api/dto/question.view-dto';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view.dto';

@Injectable()
export class QuestionQueryRepository {
  constructor(private readonly dataSource: DataSource) {}

  async findQuestionById(id: number): Promise<Question | null> {
    return this.dataSource
      .createQueryBuilder(Question, 'q')
      .where('q.id = :id', { id })
      .getOne();
  }

  async getAll(
    queryDto: QuestionsQueryDto,
  ): Promise<PaginatedViewDto<QuestionViewDto[]>> {
    const {
      bodySearchTerm,
      published,
      pageNumber = 1,
      pageSize = 10,
      sortBy = 'createdAt',
      sortDirection = 'desc',
    } = queryDto;

    const queryBuilder = this.dataSource.createQueryBuilder(Question, 'q');

    // Фильтр по тексту вопроса
    if (bodySearchTerm) {
      queryBuilder.andWhere('q.body ILIKE :searchTerm', {
        searchTerm: `%${bodySearchTerm}%`,
      });
    }

    // Фильтр по статусу публикации
    if (published !== undefined) {
      queryBuilder.andWhere('q.published = :published', { published });
    }

    // Сортировка
    const order = sortDirection.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    queryBuilder.orderBy(`q.${sortBy}`, order);

    // Пагинация
    queryBuilder.skip((pageNumber - 1) * pageSize).take(pageSize);

    const [items, totalCount] = await queryBuilder.getManyAndCount();

    const questionViewItems = items.map((item) => new QuestionViewDto(item));

    return PaginatedViewDto.mapToView({
      page: pageNumber,
      pageSize,
      totalCount,
      items: questionViewItems,
    });
  }
}
