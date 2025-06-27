import { Injectable } from '@nestjs/common';
import { UsersExternalQueryRepository } from '../../../user-accounts/infastructure/external-query/external-dto/users.external-query-repository';
import { UsersExternalService } from '../../../user-accounts/application/users.external-service';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogModelType } from '../domain/dto/blog.entity';
import { BlogsRepository } from '../infastructure/blogs.repository';
import { CreateBlogDto } from '../dto/create-blog.dto';
import { UpdateBlogDto } from '../dto/update-blog.dto';


@Injectable()
export class BlogsService {
  constructor(
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
    private blogsRepository: BlogsRepository
      ) {}
  
  async createBlog(dto: CreateBlogDto): Promise<string> {
          const blog = this.BlogModel.createInstance({
        name: dto.name,
        description: dto.description,
        websiteUrl: dto.websiteUrl
      });
  
      await this.blogsRepository.save(blog);
  
      return blog._id.toString();
    }
    async updateBlog(id: string, dto: UpdateBlogDto): Promise<string> {
      const blog = await this.blogsRepository.findOrNotFoundFail(id);
  
      // не присваиваем св-ва сущностям напрямую в сервисах! даже для изменения одного св-ва
      // создаём метод
      blog.update(dto); // change detection
  
      await this.blogsRepository.save(blog);
  
      return blog._id.toString();
    }
  
    async deleteBlog(id: string) {
      const blog = await this.blogsRepository.findOrNotFoundFail(id);
  
      blog.makeDeleted();
  
      await this.blogsRepository.save(blog);
    }
  }
  