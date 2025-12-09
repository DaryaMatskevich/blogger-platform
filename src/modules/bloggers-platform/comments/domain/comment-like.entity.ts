import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('commentLikes')
export class CommentLike {
  @PrimaryGeneratedColumn()
  id: number; // Добавляем отдельный id как PRIMARY KEY

  @Column({ type: 'integer' })
  commentId: number;

  @Column({ type: 'integer' })
  userId: number;

  @Column({
    type: 'varchar',
    length: 10,
    nullable: false,
    enum: ['Like', 'Dislike', 'None'],
    default: 'None',
  })
  status: 'Like' | 'Dislike' | 'None';

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
