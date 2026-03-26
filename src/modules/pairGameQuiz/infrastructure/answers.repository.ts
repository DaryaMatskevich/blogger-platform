import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Answer } from '../domain/answer.entity';

@Injectable()
export class AnswerRepository {
  private repo: Repository<Answer>;

  constructor(private readonly dataSource: DataSource) {
    this.repo = this.dataSource.getRepository(Answer);
  }

  async saveAnswer(answer: Answer): Promise<Answer> {
    return this.repo.save(answer);
  }

  async findAnswerById(id: string): Promise<Answer | null> {
    return this.repo.findOne({ where: { id } });
  }

  // другие методы по необходимости
}
