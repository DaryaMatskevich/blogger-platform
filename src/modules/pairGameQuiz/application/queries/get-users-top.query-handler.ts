// application/queries/get-users-top.query-handler.ts
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UsersTopViewDto } from '../../../../modules/pairGameQuiz/api/dto/users.top/users-top-view-dto';
import { GameQueryRepository } from '../../../../modules/pairGameQuiz/infrastructure/query/game-query.repository';
import { UsersTopQueryParamsDto } from '../../../../modules/pairGameQuiz/api/dto/users.top/users-top-query-params.dto';

// или query репозиторий

export class GetUsersTopQuery {
  constructor(public readonly params: UsersTopQueryParamsDto) {}
}

@QueryHandler(GetUsersTopQuery)
export class GetUsersTopQueryHandler
  implements IQueryHandler<GetUsersTopQuery, UsersTopViewDto>
{
  constructor(private readonly gameQueryRepository: GameQueryRepository) {}

  async execute(query: GetUsersTopQuery): Promise<UsersTopViewDto> {
    const { sort, pageNumber, pageSize } = query.params;

    const sortArray = Array.isArray(sort) ? sort : [sort];

    const sortOptions = sortArray.map((s) => {
      const [field, order] = s.split(' ');
      return { field, order: order?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC' };
    });

    const result = await this.gameQueryRepository.getUsersTop({
      sort: sortOptions,
      page: pageNumber,
      pageSize,
    });

    return result;
  }
}
