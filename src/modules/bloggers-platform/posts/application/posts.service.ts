import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreatePostInputDto } from '../api/input-dto/posts.input-dto';
import { Post, PostModelType } from '../domain/post.entity';
import { PostsRepository } from '../infactructure/posts.repository';
import { UpdatePostDto } from '../api/input-dto/posts.update-input.dto';
import { BlogsQueryRepository } from '../../blogs/infastructure/query/blogs.query-repository';


@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name)
    private PostModel: PostModelType,
    private postsRepository: PostsRepository,
    private blogsQueryRepository: BlogsQueryRepository
      ) {}
  
  async createPost(dto: CreatePostInputDto): Promise<string> {
          const blog = await this.blogsQueryRepository.getByIdOrNotFoundFail(dto.blogId)
    
    const post = this.PostModel.createInstance({
        title: dto.title,
        shortDescription: dto.shortDescription,
        content: dto.content,
        blogId: dto.blogId,
        blogName: blog.name,
         });
  
      await this.postsRepository.save(post);
  
      return post._id.toString();
    }
    
    async updatePost(id: string, dto: UpdatePostDto): Promise<string> {
      const post = await this.postsRepository.findOrNotFoundFail(id);
  
      // не присваиваем св-ва сущностям напрямую в сервисах! даже для изменения одного св-ва
      // создаём метод
      post.update(dto); // change detection
  
      await this.postsRepository.save(post);
  
      return post._id.toString();
    }
  
    async deletePost(id: string) {
      const post = await this.postsRepository.findOrNotFoundFail(id);
  
      post.makeDeleted();
  
      await this.postsRepository.save(post);
    }
  }
  