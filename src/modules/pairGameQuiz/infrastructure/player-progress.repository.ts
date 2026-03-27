import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import {
  PlayerProgress,
  PlayerProgressStatus,
} from '../domain/player-progress.entity';
import { User } from '../../../modules/user-accounts/users/domain/user.entity';

@Injectable()
export class PlayerProgressRepository {
  private repository: Repository<PlayerProgress>;
  constructor(private readonly dataSource: DataSource) {
    this.repository = dataSource.getRepository(PlayerProgress);
  }
  async createPlayerProgress(userId: number): Promise<PlayerProgress> {
    // Создаём сущность через репозиторий, заполняя поля
    const progress = this.repository.create({
      player: { id: userId } as User,
      score: 0,
      status: PlayerProgressStatus.Playing,
      joinedAt: new Date(),
    });
    // Сохраняем
    return this.repository.save(progress);
  }
  async savePlayerProgress(progress: PlayerProgress): Promise<PlayerProgress> {
    return this.repository.save(progress);
  }
}
