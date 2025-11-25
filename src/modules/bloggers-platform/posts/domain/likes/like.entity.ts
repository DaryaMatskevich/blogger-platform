import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('postLikes')
export class PostLike {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'postId' })
  postId: number;

  @Column({ name: 'userId' })
  userId: number;

  @Column({
    type: 'varchar',
    default: 'None',
  })
  status: string; // 'Like', 'Dislike', 'None'

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;
}
