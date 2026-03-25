// game.entity.ts
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PlayerProgress } from './player-progress.entity';
import { GameQuestion } from './game-question.entity';

export enum GameStatus {
  PendingSecondPlayer = 'PendingSecondPlayer',
  Active = 'Active',
  Finished = 'Finished',
}

@Entity('games')
export class Game {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => PlayerProgress, { cascade: true })
  @JoinColumn()
  firstPlayerProgress: PlayerProgress;

  @OneToOne(() => PlayerProgress, { cascade: true, nullable: true })
  @JoinColumn()
  secondPlayerProgress: PlayerProgress | null;

  @OneToMany(() => GameQuestion, (gameQuestion) => gameQuestion.game)
  questions: GameQuestion[];

  @Column({
    type: 'enum',
    enum: GameStatus,
    default: GameStatus.PendingSecondPlayer,
  })
  status: GameStatus;

  @CreateDateColumn({ type: 'timestamptz' })
  pairCreatedDate: Date;

  @Column({ type: 'timestamptz', nullable: true })
  startGameDate: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  finishGameDate: Date | null;
}
