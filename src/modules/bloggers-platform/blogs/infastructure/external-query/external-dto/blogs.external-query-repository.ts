
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';
import { BlogExternalDto } from './blogs.external-dto';
import { Blog, BlogModelType } from '../../../domain/dto/blog.entity';

@Injectable()
export class BlogsExternalQueryRepository {
  constructor(
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
  ) {}

  async getByIdOrNotFoundFail(id: string): Promise<BlogExternalDto> {
    const blog = await this.BlogModel.findOne({
      _id: id,
      deletedAt: null,
    });

    if (!blog) {
      throw new NotFoundException('user not found');
    }

    return BlogExternalDto.mapToView(blog);
  }
}