import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PlayerAnswer } from './player-answer.entity';
import { User } from '../../../modules/user-accounts/users/domain/user.entity';

export enum PlayerProgressStatus {
  Playing = 'playing',
  Finished = 'finished',
}

@Entity()
export class PlayerProgress {
  @PrimaryGeneratedColumn('increment')
  public id: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'playerAccountId' })
  playerAccount: User;

  @Column({ default: 0 })
  score: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  joinedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  finishedAt: Date | null;

  @Column({ default: 'playing' })
  public status: string;

  @OneToMany(() => PlayerAnswer, (answer) => answer.playerProgress)
  public answers: PlayerAnswer[];
}
