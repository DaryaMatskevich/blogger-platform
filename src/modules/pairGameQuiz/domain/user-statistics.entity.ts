// src/modules/pairGameQuiz/domain/user-statistics.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';

@Entity('user_statistics')
@Unique(['userId'])
export class UserStatistics {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  userId: number;

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
