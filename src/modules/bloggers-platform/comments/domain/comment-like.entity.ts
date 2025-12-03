import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('commentLikes')
export class CommentLike {
  @PrimaryColumn({ type: 'integer' })
  commentId: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
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
