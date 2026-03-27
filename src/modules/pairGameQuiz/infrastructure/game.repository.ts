import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Game, GameStatus } from '../domain/game.entity';
import { PlayerProgress } from '../domain/player-progress.entity';

@Injectable()
export class GameRepository {
  private repository: Repository<Game>;

  constructor(private readonly dataSource: DataSource) {
    this.repository = dataSource.getRepository(Game);
  }

  async findActiveGameByUserId(userId: number): Promise<Game | null> {
    return this.repository
      .createQueryBuilder('game')
      .leftJoinAndSelect('game.firstPlayerProgress', 'firstProgress')
      .leftJoinAndSelect('game.secondPlayerProgress', 'secondProgress')
      .where(
        '(firstProgress.playerAccountId = :userId OR secondProgress.playerAccountId = :userId) AND game.status = :status',
        { userId, status: GameStatus.Active },
      )
      .getOne();
  }

  async findPendingGame(): Promise<Game | null> {
    return this.repository
      .createQueryBuilder('game')
      .leftJoinAndSelect('game.firstPlayerProgress', 'firstProgress')
      .leftJoinAndSelect('game.secondPlayerProgress', 'secondProgress')
      .where('game.status = :status', {
        status: GameStatus.PendingSecondPlayer,
      })
      .getOne();
  }

  async createGame(firstProgress: PlayerProgress): Promise<Game> {
    const game = this.repository.create({
      firstPlayerProgress: firstProgress,
      status: GameStatus.PendingSecondPlayer,
      pairCreatedDate: new Date(),
    });
    return this.repository.save(game);
  }

  async addSecondPlayerAndStart(
    game: Game,
    secondProgress: PlayerProgress,
  ): Promise<Game> {
    game.secondPlayerProgress = secondProgress;
    game.status = GameStatus.Active;
    game.startGameDate = new Date();
    return this.repository.save(game);
  }
  async findUnfinishedGameByUserId(userId: number): Promise<Game | null> {
    return this.repository
      .createQueryBuilder('game')
      .leftJoinAndSelect('game.firstPlayerProgress', 'firstProgress')
      .leftJoinAndSelect('game.secondPlayerProgress', 'secondProgress')
      .where(
        '(firstProgress.playerAccountId = :userId OR secondProgress.playerAccountId = :userId) AND game.status IN (:...statuses)',
        {
          userId,
          statuses: [GameStatus.PendingSecondPlayer, GameStatus.Active],
        },
      )
      .getOne();
  }
}
