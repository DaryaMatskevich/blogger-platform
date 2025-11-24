import { Injectable } from '@nestjs/common';
import { GetPostsQueryParams } from '../../posts/api/input-dto/get-posts-query-params.input-dto';
import { PostsQueryRepository } from '../../posts/infactructure/query/posts.query-repository';

@Injectable()
export class BlogsService {
  constructor(private postsQueryRepository: PostsQueryRepository) {}

  async getAllPostsForBlog(
    blogId: string,
    userId: string | null,
    query: GetPostsQueryParams,
  ) {
    const posts = await this.postsQueryRepository.getPostsForBlog(
      query,
      blogId,
      userId,
    );
    return posts;
  }
}
