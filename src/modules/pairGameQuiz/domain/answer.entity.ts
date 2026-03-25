import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Question } from '../../../modules/sa/sa.quiz-questions/domain/question.entity';
import { PlayerProgress } from './player-progress.entity';

export enum AnswerStatus {
  Correct = 'Correct',
  Incorrect = 'Incorrect',
}

@Entity('answers')
export class Answer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Ссылка на вопрос (из AnswerViewModel)
  @ManyToOne(() => Question, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'questionId' })
  question: Question;

  // Статус ответа (Correct / Incorrect)
  @Column({ type: 'enum', enum: AnswerStatus, default: AnswerStatus.Incorrect })
  answerStatus: AnswerStatus;

  // Время добавления ответа
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  addedAt: Date;

  // Дополнительные поля, если необходимы для игровой логики
  // (например, текст ответа, порядковый номер, связь с игроком)

  @Column({ type: 'int', nullable: true })
  questionIndex?: number;

  @ManyToOne(() => PlayerProgress, (progress) => progress.answers, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'playerProgressId' })
  playerProgress?: PlayerProgress;
}
