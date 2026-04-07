import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GameQueryRepository } from '../../infrastructure/query/game-query.repository';
import { UserGamesViewDto } from '../../api/dto/game-view.dto';
import { Injectable } from '@nestjs/common';
import { UserGamesQueryParamsDto } from '../../api/dto/user-games-query-params.dto';

export class GetUserGamesQuery {
  constructor(
    public readonly userId: string,
    public readonly params: UserGamesQueryParamsDto,
  ) {}
}

@Injectable()
@QueryHandler(GetUserGamesQuery)
export class GetUserGamesQueryHandler
  implements IQueryHandler<GetUserGamesQuery, UserGamesViewDto>
{
  constructor(private readonly gameQueryRepository: GameQueryRepository) {}

  async execute(query: GetUserGamesQuery): Promise<UserGamesViewDto> {
    const userIdNum = parseInt(query.userId, 10);
    const { sortBy, sortDirection, pageNumber, pageSize } = query.params;

    return this.gameQueryRepository.getMyGamesView(userIdNum, {
      sortBy,
      sortDirection,
      pageNumber,
      pageSize,
    });
  }
}
