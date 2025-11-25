import { Injectable } from '@nestjs/common';
import { PostsQueryRepository } from '../../posts/infactructure/query/posts.query-repository';

@Injectable()
export class BlogsService {
  constructor(private postsQueryRepository: PostsQueryRepository) {}
}
