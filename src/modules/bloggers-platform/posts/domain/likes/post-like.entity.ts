import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('postLikes')
export class PostLike {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer', nullable: false })
  postId: number;

  @Column({ type: 'integer', nullable: false })
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
