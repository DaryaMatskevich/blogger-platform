import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CommentViewDto } from '../../api/view-dto/comments.view.dto';
import { CommentsQueryRepository } from '../../infrastructute/query/comments.query-repository';
import { LikesCommentRepository } from '../../infrastructute/likes/likesCommentRepository';


export class GetCommentByIdQuery {
  constructor(
    public id: string,
    public userId: string | null ) {}
}

@QueryHandler(GetCommentByIdQuery)
export class GetCommenttByIdQueryHandler
  implements IQueryHandler<GetCommentByIdQuery, CommentViewDto>
{
  constructor(
    private readonly commentsQueryRepository: CommentsQueryRepository,
    private likesCommentRepository: LikesCommentRepository

  ) {}

  async execute(query: GetCommentByIdQuery): Promise<CommentViewDto> {
  console.log(query.userId)
  let myStatus = "None"
    if(query.userId) {
    const likeComment = await this.likesCommentRepository.getLikeCommentByUserId(
      query.userId,
      query.id
    )
    console.log(likeComment)
    if(likeComment) {
      myStatus = likeComment.status
      console.log(myStatus)
    }
  }
  
    return this.commentsQueryRepository.getByIdWithStatusOrNotFoundFail(query.id, myStatus);
    
  }
}
