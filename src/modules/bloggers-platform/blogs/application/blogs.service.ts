import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogModelType } from '../domain/dto/blog.entity';
import { BlogsRepository } from '../infastructure/blogs.repository';
import { CreateBlogDto } from '../dto/create-blog.dto';
import { UpdateBlogDto } from '../dto/update-blog.dto';
import { GetPostsQueryParams } from '../../posts/api/input-dto/get-posts-query-params.input-dto';
import { PostsQueryRepository } from '../../posts/infactructure/query/posts.query-repository';
import { CreatePostForBlogInputDto, CreatePostInputDto } from '../../posts/api/input-dto/posts.input-dto';
import { PostsRepository } from '../../posts/infactructure/posts.repository';


@Injectable()
export class BlogsService {
  constructor(
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
    private blogsRepository: BlogsRepository,
    private postsQueryRepository: PostsQueryRepository,
    private postsRepository: PostsRepository
  ) { }

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

  async getAllPostsForBlog(id: string, query: GetPostsQueryParams) {

    const posts = await this.postsQueryRepository.getPostsForBlog(query, id)
    return posts

  }

  async blogExists(id: string) {
    return this.BlogModel.exists({
      _id: id,
      deletedAt: null
    })
  }
}
