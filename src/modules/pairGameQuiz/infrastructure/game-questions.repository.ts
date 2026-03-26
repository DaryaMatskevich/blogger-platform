import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { GameQuestion } from '../domain/game-question.entity';
import { Game } from '../domain/game.entity';
import { Question } from '../../../modules/sa/sa.quiz-questions/domain/question.entity';

@Injectable()
export class GameQuestionsRepository {
  private repository: Repository<GameQuestion>;

  constructor(private readonly dataSource: DataSource) {
    this.repository = this.dataSource.getRepository(GameQuestion);
  }

  async createGameQuestions(game: Game, questions: Question[]): Promise<void> {
    const gameQuestions = questions.map((q, index) =>
      this.repository.create({
        game,
        question: q,
        order: index + 1,
      }),
    );
    await this.repository.save(gameQuestions);
  }
}
