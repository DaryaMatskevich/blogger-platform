import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Post } from '../../posts/domain/post.entity';
import { BLOG } from '../constants/blog.constants';

@Entity('blogs')
export class Blog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: BLOG.NAME.MAX,
    nullable: false,
  })
  name: string;

  @Column({
    type: 'varchar',
    length: BLOG.DESCRIPTION.MAX,
    nullable: false,
  })
  description: string;

  @Column({
    type: 'varchar',
    length: BLOG.WEBSITE_URL.MAX,
    nullable: false,
  })
  websiteUrl: string;

  @Column({
    type: 'boolean',
    default: false,
    nullable: false,
  })
  isMembership: boolean;

  @CreateDateColumn({
    type: 'timestamp',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
  })
  updatedAt: Date;

  @DeleteDateColumn({
    type: 'timestamp',
  })
  deletedAt: Date | null;

  @OneToMany(() => Post, (post) => post.blog)
  posts: Post[];
}
