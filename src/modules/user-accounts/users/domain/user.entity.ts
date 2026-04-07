// entities/user.entity.ts
import {
  Column,
  DeleteDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserStatistic } from '../../../pairGameQuiz/domain/user-statistic.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 10,
    nullable: false,
    unique: true,
  })
  login: string;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  passwordHash: string;

  @Column({
    type: 'varchar',
    nullable: false,
    unique: true,
  })
  email: string;

  @Column({
    type: 'timestamp',
    nullable: false,
  })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt: Date | null;

  @OneToOne(() => UserStatistic, (userStatistics) => userStatistics.user)
  userStatistics: UserStatistic;
}
