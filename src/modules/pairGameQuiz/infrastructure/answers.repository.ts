import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
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

  // другие методы по необходимости
}
