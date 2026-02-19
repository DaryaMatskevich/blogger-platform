import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('sessions')
export class Session {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: string;

  @Column({ type: 'varchar' })
  ip: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'varchar' })
  deviceId: string;

  @Column({ type: 'varchar' })
  refreshToken: string;

  @Column({ type: 'timestamp' })
  lastActiveDate: Date;

  @Column({ type: 'timestamp' })
  expirationDate: Date;

  @CreateDateColumn({})
  createdAt: Date;

  @UpdateDateColumn({})
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt: Date | null;
}
