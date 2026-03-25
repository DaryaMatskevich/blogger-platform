import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PlayerProgress } from './player-progress.entity';
import { GameQuestion } from './game-question.entity'; // предполагаемая сущность, связывающая вопрос с игрой

@Entity()
export class PlayerAnswer {
  @PrimaryGeneratedColumn('increment')
  public id: number;

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

  // Флаг правильности ответа (вычисляется при сохранении)
  @Column({ default: false })
  public isCorrect: boolean;

  // Время, когда игрок дал ответ
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  public answeredAt: Date;
}
