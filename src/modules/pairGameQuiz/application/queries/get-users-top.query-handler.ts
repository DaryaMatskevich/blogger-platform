// get-users-top.query-handler.ts
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UsersTopQueryParamsDto } from '../../api/dto/users.top/users-top-query-params.dto';
import { UserStatisticsQueryRepository } from '../../../../modules/pairGameQuiz/infrastructure/query/users-statistics.query.repository';
import {
  UsersTopViewDto,
  UserTopItemDto,
} from '../../../../modules/pairGameQuiz/api/dto/users.top/users-top-view-dto';

export class GetUsersTopQuery {
  constructor(public readonly params: UsersTopQueryParamsDto) {}
}

@QueryHandler(GetUsersTopQuery)
export class GetUsersTopQueryHandler
  implements IQueryHandler<GetUsersTopQuery, UsersTopViewDto>
{
  constructor(
    private readonly userStatisticsQueryRepository: UserStatisticsQueryRepository,
  ) {}

  async execute(query: GetUsersTopQuery): Promise<UsersTopViewDto> {
    const { sort, pageNumber, pageSize } = query.params;

    // Теперь sort всегда массив строк (благодаря Transform в DTO)
    const sortOptions = sort
      .map((s) => {
        const [field, order] = s.split(' ');
        if (!field) return null;
        return {
          field: field.trim(),
          order: order?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC',
        };
      })
      .filter(
        (opt): opt is { field: string; order: 'ASC' | 'DESC' } => opt !== null,
      );

    const skip = (pageNumber - 1) * pageSize;

    const { items: rawItems, totalCount } =
      await this.userStatisticsQueryRepository.getLeaderboard({
        sort: sortOptions,
        skip,
        take: pageSize,
      });

    const items: UserTopItemDto[] = rawItems.map((item: any) => ({
      sumScore: item.sumScore,
      avgScores: item.avgScores,
      gamesCount: item.gamesCount,
      winsCount: item.winsCount,
      lossesCount: item.lossesCount,
      drawsCount: item.drawsCount,
      player: {
        id: item.player.id,
        login: item.player.login,
      },
    }));

    const pagesCount = Math.ceil(totalCount / pageSize);

    return {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount,
      items,
    };
  }
}
