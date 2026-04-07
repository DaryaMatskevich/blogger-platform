import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../../modules/user-accounts/users/domain/user.entity';

@Entity('user_statistic')
export class UserStatistic {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, { onDelete: 'CASCADE' }) // при удалении пользователя удалится и статистика
  @JoinColumn({ name: 'userId' }) // внешний ключ будет в колонке 'userId' таблицы user_statistics
  user: User;

  @Column({ type: 'int', default: 0 })
  sumScore: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  avgScores: number;

  @Column({ type: 'int', default: 0 })
  gamesCount: number;

  @Column({ type: 'int', default: 0 })
  winsCount: number;

  @Column({ type: 'int', default: 0 })
  lossesCount: number;

  @Column({ type: 'int', default: 0 })
  drawsCount: number;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
