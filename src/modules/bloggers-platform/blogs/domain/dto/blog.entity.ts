import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CreateBlogInputDto } from '../../api/input-dto/blogs.input-dto';

export const nameConstraints = {
  minLength: 1,
  maxLength: 15,
};

export const descriptionConstraints = {
  minLength: 1,
  maxLength: 500,
};

export const websiteUrlConstraints = {
  minLength: 1,
  maxLength: 100,
  match: /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/,
};

@Entity('blogs')
export class Blog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: nameConstraints.maxLength,
    nullable: false,
  })
  name: string;

  @Column({
    type: 'varchar',
    length: descriptionConstraints.maxLength,
    nullable: false,
  })
  description: string;

  @Column({
    type: 'varchar',
    length: websiteUrlConstraints.maxLength,
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

  static createBlog(dto: CreateBlogInputDto): Blog {
    const blog = new Blog();
    blog.name = dto.name;
    blog.description = dto.description;
    blog.websiteUrl = dto.websiteUrl;
    blog.isMembership = false;

    return blog;
  }
}
