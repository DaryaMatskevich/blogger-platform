import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { PostViewDto } from '../../api/view-dto/posts.view-dto';
import { PostsQueryRepository } from '../../infactructure/query/posts.query-repository';
import { LikesPostRepository } from '../../infactructure/likes/likesPostRepository';


export class GetPostByIdQuery {
  constructor(
    public id: string,
    public userId: string | null ) {}
}

@QueryHandler(GetPostByIdQuery)
export class GetPostByIdQueryHandler
  implements IQueryHandler<GetPostByIdQuery, PostViewDto>
{
  constructor(
    @Inject(PostsQueryRepository)
    private readonly postsQueryRepository: PostsQueryRepository,
    private likesPostRepository: LikesPostRepository
  ) {}

  async execute(query: GetPostByIdQuery): Promise<PostViewDto> {
  console.log(query.userId)
  let myStatus = "None"
    if(query.userId) {
    const likePost = await this.likesPostRepository.getLikePostByUserId(
      query.userId,
      query.id
    )
    console.log(likePost)
    if(likePost) {
      myStatus = likePost.status
      console.log(myStatus)
    }
  }
  
    return this.postsQueryRepository.getByIdWithStatusOrNotFoundFail(query.id, myStatus);
    
  }
}
