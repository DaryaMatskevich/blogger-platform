import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Injectable, NotFoundException } from '@nestjs/common';

import { GameQueryRepository } from '../../infrastructure/query/game-query.repository'; // предположим
import { GameViewDto } from '@src/modules/pairGameQuiz/api/dto/game-view.dto';

export class GetGameByIdQuery {
  constructor(
    public readonly id: string,
    public readonly userId: string,
  ) {}
}

@Injectable()
@QueryHandler(GetGameByIdQuery)
export class GetGameByIdHandler
  implements IQueryHandler<GetGameByIdQuery, GameViewDto>
{
  constructor(
    private readonly gameQueryRepository: GameQueryRepository,
    // возможно, другие репозитории, если нужны проверки прав
  ) {}

  async execute(query: GetGameByIdQuery): Promise<GameViewDto> {
    const { id, userId } = query;
    const userIdNumber = Number(userId);

    const game = await this.gameQueryRepository.findGameByIdAndUserId(
      id,
      userIdNumber,
    );
    if (!game) {
      throw new NotFoundException('Game not found');
    }

    return game;
  }
}
