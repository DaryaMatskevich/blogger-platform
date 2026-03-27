import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PlayerProgress } from './player-progress.entity';
import { GameQuestion } from './game-question.entity'; // предполагаемая сущность, связывающая вопрос с игрой

export enum AnswerStatus {
  Correct = 'Correct',
  Incorrect = 'Incorrect',
}

@Entity()
export class PlayerAnswer {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  // Связь с прогрессом игрока (чей это ответ)
  @ManyToOne(() => PlayerProgress, (progress) => progress.answers, {
    nullable: false,
  })
  @JoinColumn()
  public playerProgress: PlayerProgress;

  // Связь с конкретным вопросом в игре (который был задан)
  @ManyToOne(() => GameQuestion, { nullable: false })
  @JoinColumn()
  public gameQuestion: GameQuestion;

  // Статус ответа (Correct / Incorrect)
  @Column({ type: 'enum', enum: AnswerStatus, default: AnswerStatus.Incorrect })
  answerStatus: AnswerStatus;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  addedAt: Date;

  @Column({ type: 'int', nullable: true })
  questionIndex?: number;
}
