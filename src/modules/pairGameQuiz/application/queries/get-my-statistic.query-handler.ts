import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UsersStatisticsQueryRepository } from '../../../../modules/pairGameQuiz/infrastructure/query/users-statistics.query.repository';
import { MyStatisticViewDto } from '../../../../modules/pairGameQuiz/api/dto/statistic/my-statistic-view.dto';

export class GetMyStatisticQuery {
  constructor(public readonly userId: string) {}
}

@QueryHandler(GetMyStatisticQuery)
export class GetMyStatisticQueryHandler
  implements IQueryHandler<GetMyStatisticQuery, MyStatisticViewDto>
{
  constructor(
    private readonly usersStatisticsQueryRepository: UsersStatisticsQueryRepository,
  ) {}

  async execute(query: GetMyStatisticQuery): Promise<MyStatisticViewDto> {
    const { userId } = query;
    const userIdNum = parseInt(userId, 10);
    // Репозиторий всегда возвращает готовый DTO, даже если в БД нет статистики (будут нули)
    return this.usersStatisticsQueryRepository.getMyStatistic(userIdNum);
  }
}
