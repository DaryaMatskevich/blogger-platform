import { Injectable } from '@nestjs/common';
import { DataSource, FindManyOptions, Repository } from 'typeorm';
import { PlayerAnswer } from '../../../modules/pairGameQuiz/domain/player-answer.entity';

@Injectable()
export class AnswerRepository {
  private repo: Repository<PlayerAnswer>;

  constructor(private readonly dataSource: DataSource) {
    this.repo = this.dataSource.getRepository(PlayerAnswer);
  }

  async saveAnswer(answer: PlayerAnswer): Promise<PlayerAnswer> {
    return this.repo.save(answer);
  }

  async findAnswerById(id: string): Promise<PlayerAnswer | null> {
    return this.repo.findOne({ where: { id } });
  }
  async findByPlayerProgressId(
    playerProgressId: number,
    relations?: string[],
  ): Promise<PlayerAnswer[]> {
    return this.repo.find({
      where: { playerProgress: { id: playerProgressId } },
      relations: relations || [],
    });
  }

  /**
   * Общий метод find для кастомных запросов
   */
  async find(options?: FindManyOptions<PlayerAnswer>): Promise<PlayerAnswer[]> {
    return this.repo.find(options);
  }
  // другие методы по необходимости
}
