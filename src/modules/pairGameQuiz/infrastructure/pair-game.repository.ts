import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Game, GameStatus } from '../domain/game.entity';
import { PlayerProgress } from '../domain/player-progress.entity';
import { GameQuestion } from '../domain/game-question.entity';
import { Question } from '../../../modules/sa/sa.quiz-questions/domain/question.entity';
import { User } from '../../../modules/user-accounts/users/domain/user.entity';

@Injectable()
export class PairGameRepository {
  constructor(private readonly dataSource: DataSource) {}

  async findActiveGameByUserId(userId: number): Promise<Game | null> {
    return this.dataSource
      .createQueryBuilder(Game, 'game')
      .leftJoinAndSelect('game.firstPlayerProgress', 'firstProgress')
      .leftJoinAndSelect('game.secondPlayerProgress', 'secondProgress')
      .where(
        '(firstProgress.playerAccountId = :userId OR secondProgress.playerAccountId = :userId)',
        { userId },
      )
      .andWhere('game.status IN (:...activeStatuses)', {
        activeStatuses: [GameStatus.PendingSecondPlayer, GameStatus.Active],
      })
      .getOne();
  }

  async findPendingGame(): Promise<Game | null> {
    return this.dataSource
      .createQueryBuilder(Game, 'game')
      .leftJoinAndSelect('game.firstPlayerProgress', 'firstProgress')
      .leftJoinAndSelect('game.secondPlayerProgress', 'secondProgress')
      .where('game.status = :status', {
        status: GameStatus.PendingSecondPlayer,
      })
      .getOne();
  }

  async getRandomQuestions(count: number): Promise<Question[]> {
    const manager = this.dataSource.manager;
    const questions = await manager
      .createQueryBuilder(Question, 'q')
      .orderBy('RANDOM()')
      .take(count)
      .getMany();

    if (questions.length < count) {
      throw new Error('Not enough questions in the database');
    }

    return questions;
  }

  async createPlayerProgress(userId: number): Promise<PlayerProgress> {
    const manager = this.dataSource.manager;
    const user = await manager.findOne(User, { where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    const progress = manager.create(PlayerProgress, {
      playerAccount: user,
      score: 0,
      joinedAt: new Date(),
      finishedAt: null,
    });
    await manager.save(progress);
    return progress;
  }

  async createGame(firstProgress: PlayerProgress): Promise<Game> {
    const manager = this.dataSource.manager;
    const game = manager.create(Game, {
      firstPlayerProgress: firstProgress,
      status: GameStatus.PendingSecondPlayer,
      createdAt: new Date(),
    });
    await manager.save(game);
    return game;
  }

  async addSecondPlayerAndStart(
    game: Game,
    secondProgress: PlayerProgress,
  ): Promise<Game> {
    const manager = this.dataSource.manager;
    game.secondPlayerProgress = secondProgress;
    game.status = GameStatus.Active;
    game.startGameDate = new Date();
    await manager.save(game);
    return game;
  }

  async createGameQuestions(game: Game, questions: Question[]): Promise<void> {
    const manager = this.dataSource.manager;
    const gameQuestions = questions.map((q, index) =>
      manager.create(GameQuestion, {
        game: game,
        question: q,
        order: index,
      }),
    );
    await manager.save(gameQuestions);
  }

  async findGameWithRelations(gameId: number): Promise<Game | null> {
    return this.dataSource
      .createQueryBuilder(Game, 'game')
      .leftJoinAndSelect('game.firstPlayerProgress', 'firstProgress')
      .leftJoinAndSelect('firstProgress.playerAccount', 'firstPlayer')
      .leftJoinAndSelect('firstProgress.answers', 'firstAnswers')
      .leftJoinAndSelect('firstAnswers.question', 'firstAnswerQuestion')
      .leftJoinAndSelect('game.secondPlayerProgress', 'secondProgress')
      .leftJoinAndSelect('secondProgress.playerAccount', 'secondPlayer')
      .leftJoinAndSelect('secondProgress.answers', 'secondAnswers')
      .leftJoinAndSelect('secondAnswers.question', 'secondAnswerQuestion')
      .leftJoinAndSelect('game.questions', 'gameQuestions')
      .leftJoinAndSelect('gameQuestions.question', 'gameQuestion')
      .where('game.id = :gameId', { gameId })
      .getOne();
  }
}
