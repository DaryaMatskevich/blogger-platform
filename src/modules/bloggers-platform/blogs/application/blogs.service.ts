import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogModelType } from '../domain/dto/blog.entity';
import { GetPostsQueryParams } from '../../posts/api/input-dto/get-posts-query-params.input-dto';
import { PostsQueryRepository } from '../../posts/infactructure/query/posts.query-repository';



@Injectable()
export class BlogsService {
  constructor(
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
    private postsQueryRepository: PostsQueryRepository,

  ) { }

  async getAllPostsForBlog(id: string, query: GetPostsQueryParams) {

    const posts = await this.postsQueryRepository.getPostsForBlog(query, id)
    return posts

  }

  async blogExists(id: string) {
   const exists = await this.BlogModel.findOne({ _id: id, deletedAt: null }).lean();
return !!exists;
}
}