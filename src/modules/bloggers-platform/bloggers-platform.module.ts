import { Module } from '@nestjs/common';
import { BlogsService } from './blogs/application/blogs.service';
import { BlogsRepository } from './blogs/infastructure/blogs.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from './blogs/domain/dto/blog.entity';
import { BlogsController } from './blogs/api/blogs.controller';
import { BlogsQueryRepository } from './blogs/infastructure/query/blogs.query-repository';
import { BlogsExternalQueryRepository } from './blogs/infastructure/external-query/external-dto/blogs.external-query-repository';

//тут регистрируем провайдеры всех сущностей блоггерской платформы (blogs, posts, comments, etc...)
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),
  ],
  controllers: [BlogsController],
  providers: [BlogsService,
    BlogsRepository,
  BlogsQueryRepository,
  BlogsExternalQueryRepository
],
exports: [BlogsExternalQueryRepository],
})
export class BloggersPlatformModule { }
