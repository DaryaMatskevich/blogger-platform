import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Blog } from '../../blogs/domain/blog.entity';
import { POST } from '../../../../modules/bloggers-platform/posts/constants/post.constants';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    nullable: false,
    length: POST.TITLE.MAX,
  })
  title: string;

  @Column({
    name: 'shortDescription',
    type: 'varchar',
    nullable: false,
    length: POST.SHORT_DESCRIPTION.MAX,
  })
  shortDescription: string;

  @Column({
    type: 'varchar',
    nullable: false,
    length: POST.CONTENT.MAX,
  })
  content: string;

  @Column({
    name: 'blogId',
    type: 'integer',
    nullable: false,
  })
  blogId: number;

  @CreateDateColumn({
    name: 'createdAt',
    type: 'timestamp',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updatedAt',
    type: 'timestamp',
  })
  updatedAt: Date;

  @Column({
    name: 'deletedAt',
    type: 'timestamp',
    nullable: true,
    default: null,
  })
  deletedAt: Date | null;

  @ManyToOne(() => Blog, (blog) => blog.posts)
  @JoinColumn({ name: 'blogId' })
  blog: Blog;
}
