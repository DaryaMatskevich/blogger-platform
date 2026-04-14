import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserStatistic } from '../domain/user-statistic.entity';

@Injectable()
export class UsersStatisticsRepository {
  constructor(
    @InjectRepository(UserStatistic)
    private readonly usersStatisticsRepository: Repository<UserStatistic>,
  ) {}

  async save(userStatistic: UserStatistic): Promise<UserStatistic> {
    return this.usersStatisticsRepository.save(userStatistic);
  }
  async updateAfterGame(
    userId: number,
    gameScore: number,
    result: 'win' | 'loss' | 'draw',
  ): Promise<void> {
    // Получаем текущую статистику, если есть
    const existing = await this.usersStatisticsRepository.findOne({
      where: { user: { id: userId } },
    });

    const newGamesCount = (existing?.gamesCount || 0) + 1;
    const newSumScore = (existing?.sumScore || 0) + gameScore;
    const newAvgScores = newSumScore / newGamesCount;
    const newWins = (existing?.winsCount || 0) + (result === 'win' ? 1 : 0);
    const newLosses =
      (existing?.lossesCount || 0) + (result === 'loss' ? 1 : 0);
    const newDraws = (existing?.drawsCount || 0) + (result === 'draw' ? 1 : 0);

    // Атомарная вставка или обновление (без race condition)
    await this.usersStatisticsRepository.upsert(
      {
        user: { id: userId },
        gamesCount: newGamesCount,
        sumScore: newSumScore,
        avgScores: newAvgScores,
        winsCount: newWins,
        lossesCount: newLosses,
        drawsCount: newDraws,
      },
      ['user'], // уникальное поле – связь с пользователем
    );
  }
}
