import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { GameQueryRepository } from '../../infrastructure/query/game-query.repository'; // предположим
import { GameViewDto } from '../../../pairGameQuiz/api/dto/game-view.dto';

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

    const existingGame = await this.gameQueryRepository.findGameById(id);
    if (!existingGame) {
      throw new NotFoundException(`Game with id ${id} not found`);
    }

    const game = await this.gameQueryRepository.findGameByIdAndUserId(
      id,
      userIdNumber,
    );
    if (game) return game;

    // Игра существует, но пользователь не участник
    throw new ForbiddenException('You are not a participant of this game');
  }
}
