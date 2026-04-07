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
    // Находим существующую запись через связь user
    let stats = await this.usersStatisticsRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!stats) {
      // Создаём новую статистику, привязывая пользователя
      stats = this.usersStatisticsRepository.create({
        user: { id: userId }, // TypeORM поймёт, что нужно установить userId внешним ключом
        gamesCount: 0,
        sumScore: 0,
        avgScores: 0,
        winsCount: 0,
        lossesCount: 0,
        drawsCount: 0,
      });
    }

    // Обновляем поля
    stats.gamesCount += 1;
    stats.sumScore += gameScore;
    stats.avgScores = stats.sumScore / stats.gamesCount;

    if (result === 'win') stats.winsCount += 1;
    else if (result === 'loss') stats.lossesCount += 1;
    else if (result === 'draw') stats.drawsCount += 1;

    await this.usersStatisticsRepository.save(stats);
  }
}
