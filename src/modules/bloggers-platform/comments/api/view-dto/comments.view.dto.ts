import { Comment } from '../../domain/comment.entity';

export class CommentViewDto {
  id: string;
  content: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  createdAt: Date;
  likesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: string;
  };

  static mapToView(
    comment: Comment,
    likesInfo?: {
      likesCount: number;
      dislikesCount: number;
    },
  ): CommentViewDto {
    const dto = new CommentViewDto();

    dto.id = comment.id.toString();
    dto.content = comment.content;
    dto.commentatorInfo = {
      userId: comment.userId.toString(),
      userLogin: comment.userLogin,
    };
    dto.createdAt = comment.createdAt;
    dto.likesInfo = {
      likesCount: likesInfo?.likesCount || 0,
      dislikesCount: likesInfo?.dislikesCount || 0,
      myStatus: 'None',
    };

    return dto;
  }

  static mapToViewWithStatus(
    comment: any,
    myStatus: 'None' | 'Like' | 'Dislike',
    likesInfo?: {
      likesCount: number;
      dislikesCount: number;
    },
  ): CommentViewDto {
    const dto = new CommentViewDto();

    dto.id = comment.id.toString();
    dto.content = comment.content;
    dto.commentatorInfo = {
      userId: comment.userId.toString(),
      userLogin: comment.userLogin || '',
    };
    dto.createdAt = comment.createdAt;
    dto.likesInfo = {
      likesCount: likesInfo?.likesCount || 0,
      dislikesCount: likesInfo?.dislikesCount || 0,
      myStatus: myStatus,
    };

    return dto;
  }
}
