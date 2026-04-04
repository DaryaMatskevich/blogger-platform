// infrastructure/user-statistics.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserStatistics } from '../domain/user-statistics.entity';

@Injectable()
export class UsersStatisticsRepository {
  constructor(
    @InjectRepository(UserStatistics)
    private readonly usersStatisticsRepo: Repository<UserStatistics>,
  ) {}

  /**
   * Обновляет статистику пользователя после завершения игры
   * @param userId - ID пользователя
   * @param gameScore - количество очков, набранных в этой игре
   * @param result - результат игры: 'win', 'loss', 'draw'
   */
  async updateAfterGame(
    userId: number,
    gameScore: number,
    result: 'win' | 'loss' | 'draw',
  ): Promise<void> {
    // Находим существующую запись или создаём новую
    let stats = await this.usersStatisticsRepo.findOne({ where: { userId } });
    if (!stats) {
      stats = this.usersStatisticsRepo.create({ userId });
    }

    // Обновляем поля
    stats.gamesCount += 1;
    stats.sumScore += gameScore;
    stats.avgScores = stats.sumScore / stats.gamesCount;

    if (result === 'win') {
      stats.winsCount += 1;
    } else if (result === 'loss') {
      stats.lossesCount += 1;
    } else if (result === 'draw') {
      stats.drawsCount += 1;
    }

    await this.usersStatisticsRepo.save(stats);
  }

  /**
   * Получить статистику пользователя
   */
}
