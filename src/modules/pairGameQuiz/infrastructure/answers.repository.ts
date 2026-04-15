import { Injectable } from '@nestjs/common';
import { DataSource, FindManyOptions, Repository } from 'typeorm';
import {
  AnswerStatus,
  PlayerAnswer,
} from '../../../modules/pairGameQuiz/domain/player-answer.entity';

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
  async count(options?: FindManyOptions<PlayerAnswer>): Promise<number> {
    return this.repo.count(options);
  }
  async insertAnswer(answer: PlayerAnswer): Promise<PlayerAnswer> {
    // Удаляем id, если он есть (на всякий случай)
    delete (answer as any).id;
    const result = await this.repo.insert(answer);
    // Возвращаем объект с новым id
    return { ...answer, id: result.identifiers[0].id } as PlayerAnswer;
  }
  async insertMissingAnswer(
    playerProgressId: number,
    gameQuestionId: number,
  ): Promise<void> {
    await this.repo.insert({
      playerProgress: { id: playerProgressId },
      gameQuestion: { id: gameQuestionId },
      answerStatus: AnswerStatus.Incorrect,
      addedAt: new Date(),
    });
  }
  async forceInsertAnswer(
    playerProgressId: number,
    gameQuestionId: number,
    status: AnswerStatus,
  ): Promise<void> {
    await this.repo
      .createQueryBuilder()
      .insert()
      .into(PlayerAnswer)
      .values({
        playerProgress: { id: playerProgressId },
        gameQuestion: { id: gameQuestionId },
        answerStatus: status,
        addedAt: new Date(),
      })
      .execute();
  } // другие методы по необходимости
}
