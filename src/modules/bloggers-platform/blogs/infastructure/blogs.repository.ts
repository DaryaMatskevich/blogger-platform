import { InjectModel } from '@nestjs/mongoose';

import { Injectable, NotFoundException } from '@nestjs/common';
import { Blog, BlogDocument, BlogModelType } from '../domain/dto/blog.entity';

@Injectable()
export class BlogsRepository {
  //инжектирование модели через DI
  constructor(@InjectModel(Blog.name) private BlogModel: BlogModelType) {}

  async findById(id: string): Promise<BlogDocument | null> {
    return this.BlogModel.findOne({
      _id: id,
      deletedAt: null,
    });
  }

  async save(blog: BlogDocument) {
    await blog.save();
  }

  async findOrNotFoundFail(id: string): Promise<BlogDocument> {
    const blog = await this.BlogModel.findById(id);

    if (!blog) {
      //TODO: replace with domain exception
      throw new NotFoundException('user not found');
    }

    return blog;
  }
}
