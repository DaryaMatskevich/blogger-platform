import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export const contentConstraints = {
  minLength: 20,
  maxLength: 300,
  // или другие настройки
};

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer', nullable: false })
  postId: number;

  @Column({ type: 'varchar', length: 300, nullable: false })
  content: string;

  @Column({ type: 'integer', nullable: false })
  userId: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  userLogin: string;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt: Date | null;
}
