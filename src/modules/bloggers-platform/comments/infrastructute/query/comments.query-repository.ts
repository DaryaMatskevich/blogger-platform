import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Comment, CommentModelType } from '../../domain/comment.entity';
import { CommentViewDto } from '../../api/view-dto/comments.view.dto';
import { DomainException } from '../../../../../core/exeptions/domain-exeptions';
import { DomainExceptionCode } from '../../../../../core/exeptions/domain-exeption-codes';
import { LikeComment, LikeCommentModelType } from '../../domain/likes/like.entity';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view.dto';
import { FilterQuery } from 'mongoose';
import { GetCommentsQueryParams } from '../../api/input-dto/get-comments-query-params.input-dto';




@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name)
    private CommentModel: CommentModelType,
     @InjectModel(LikeComment.name)
        private LikeCommentModel: LikeCommentModelType,
  ) { }

  async getByIdOrNotFoundFail(id: string): Promise<CommentViewDto> {
    const comment = await this.CommentModel.findOne({
      _id: id,
      deletedAt: null,
    });

    if (!comment) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: "Post not found",
      })
    }

    return CommentViewDto.mapToView(comment);
  }

  async getByIdWithStatusOrNotFoundFail(commentId: string, myStatus: string): Promise<CommentViewDto> {
    const comment = await this.CommentModel.findOne({
      _id: commentId,
      deletedAt: null,
    });

    if (!comment) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: "Post not found"
      })
    }

    return CommentViewDto.mapToViewWithStatus(comment, myStatus);
  }

async getCommentsForPost(
    query: GetCommentsQueryParams, postId: string, userId?: string | null
  ): Promise<PaginatedViewDto<CommentViewDto[]>> {
    const filter: FilterQuery<Comment> = {
      deletedAt: null,
      postId: postId
    };

    const comments = await this.CommentModel.find(filter)
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(query.calculateSkip())
      .limit(query.pageSize);

 console.log(comments)
      const commentsIds = comments.map(p => p._id.toString())
      
      const userStatuses = userId ?
      await this.LikeCommentModel.find({
        userId: userId,
        commentId: { $in: commentsIds }
      }).lean()
      : []

       const userStatusMap = new Map(
            userStatuses.map(status => [
                status.commentId.toString(), 
                status.status
            ])
        );


        const [likesAggregation, dislikesAggregation] = await Promise.all([
        this.LikeCommentModel.aggregate([
      {
        $match: {
          commentId: { $in: commentsIds },
          status: "Like"
        }
      },
      {
        $group: {
          _id: "$commentId",
          count: { $sum: 1 }
        }
      }
    ]),
    // Дизлайки
    this.LikeCommentModel.aggregate([
      {
        $match: {
          commentId: { $in: commentsIds },
          status: "Dislike"
        }
      },
      {
        $group: {
          _id: "$commentId",
          count: { $sum: 1 }
        }
      }
    ]),
  ]);

  // Создаем мапы для быстрого доступа
  const likesMap = new Map(likesAggregation.map(item => [item._id.toString(), item.count]));
  const dislikesMap = new Map(dislikesAggregation.map(item => [item._id.toString(), item.count]));
  
  // Формируем результат
  const items = comments.map(comment => {
    const commentId = comment._id.toString();
    
    return {
      ...CommentViewDto.mapToView(comment),
      likesInfo: {
        likesCount: likesMap.get(commentId) || 0,
        dislikesCount: dislikesMap.get(commentId) || 0,
        myStatus: userStatusMap.get(commentId) || "None",
        
      }
    };
  });
        

    const totalCount = await this.CommentModel.countDocuments(filter);

    // const items = posts.map(PostViewDto.mapToView);

    return PaginatedViewDto.mapToView({
      page: query.pageNumber,
      size: query.pageSize,
      totalCount,
      items
    });
  }
}