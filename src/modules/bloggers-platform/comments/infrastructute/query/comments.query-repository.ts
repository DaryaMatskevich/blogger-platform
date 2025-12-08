import { Injectable } from '@nestjs/common';
import { CommentViewDto } from '../../api/view-dto/comments.view.dto';
import { DomainException } from '../../../../../core/exeptions/domain-exeptions';
import { DomainExceptionCode } from '../../../../../core/exeptions/domain-exeption-codes';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view.dto';
import { GetCommentsQueryParams } from '../../api/input-dto/get-comments-query-params.input-dto';
import { DataSource } from 'typeorm';

@Injectable()
export class CommentsQueryRepository {
  constructor(private dataSource: DataSource) {}

  async getByIdOrNotFoundFail(id: number): Promise<CommentViewDto> {
    const query = `
      SELECT 
        c.*,
        u.login as "userLogin"
      FROM comments c
      LEFT JOIN users u ON c."userId" = u.id
      WHERE c.id = $1 AND c."deletedAt" IS NULL
    `;

    const result = await this.dataSource.query(query, [id]);
    const comment = result[0];

    if (!comment) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Comment not found',
      });
    }
    const likesQuery = `
    SELECT 
      COUNT(CASE WHEN status = 'Like' THEN 1 END) as "likesCount",
      COUNT(CASE WHEN status = 'Dislike' THEN 1 END) as "dislikesCount"
    FROM "commentLikes"
    WHERE "commentId" = $1
  `;

    const likesResult = await this.dataSource.query(likesQuery, [id]);
    const likesInfo = likesResult[0] || { likesCount: 0, dislikesCount: 0 };
    return CommentViewDto.mapToView(comment, {
      likesCount: parseInt(likesInfo.likesCount) || 0,
      dislikesCount: parseInt(likesInfo.dislikesCount) || 0,
    });
  }

  async getByIdWithStatusOrNotFoundFail(
    commentId: number,
    myStatus: 'None' | 'Like' | 'Dislike',
  ): Promise<CommentViewDto> {
    const query = `
      SELECT 
        c.*,
        u.login as "userLogin"
      FROM comments c
      LEFT JOIN users u ON c."userId" = u.id
      WHERE c.id = $1 AND c."deletedAt" IS NULL
    `;

    const result = await this.dataSource.query(query, [commentId]);
    const comment = result[0];

    if (!comment) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Comment not found',
      });
    }
    const likesQuery = `
    SELECT 
      COUNT(CASE WHEN status = 'Like' THEN 1 END) as "likesCount",
      COUNT(CASE WHEN status = 'Dislike' THEN 1 END) as "dislikesCount"
    FROM "commentLikes"
    WHERE "commentId" = $1
  `;

    const likesResult = await this.dataSource.query(likesQuery, [commentId]);
    const likesInfo = likesResult[0] || { likesCount: 0, dislikesCount: 0 };

    return CommentViewDto.mapToViewWithStatus(comment, myStatus, {
      likesCount: parseInt(likesInfo.likesCount) || 0,
      dislikesCount: parseInt(likesInfo.dislikesCount) || 0,
    });
  }

  async getCommentsForPost(
    query: GetCommentsQueryParams,
    postId: string,
  ): Promise<PaginatedViewDto<CommentViewDto[]>> {
    const commentsQuery = `
    SELECT 
      c.*,
      u.login as "userLogin",
      0 as "likesCount",  -- Добавляем нулевые счетчики
      0 as "dislikesCount",
      'None' as "myStatus"  -- И дефолтный статус
    FROM comments c
    LEFT JOIN users u ON c."userId" = u.id
    WHERE c."deletedAt" IS NULL AND c."postId" = $1
    ORDER BY c."${query.sortBy}" ${query.sortDirection}
    LIMIT $2 OFFSET $3
  `;

    const comments = await this.dataSource.query(commentsQuery, [
      postId,
      query.pageSize,
      query.calculateSkip(),
    ]);

    if (comments.length === 0) {
      return PaginatedViewDto.mapToView({
        page: query.pageNumber,
        size: query.pageSize,
        totalCount: 0,
        items: [],
      });
    }

    // Получаем общее количество комментариев
    const countQuery = `
    SELECT COUNT(*)
    FROM comments
    WHERE "deletedAt" IS NULL AND "postId" = $1
  `;
    const countResult = await this.dataSource.query(countQuery, [postId]);
    const totalCount = parseInt(countResult[0].count);

    // Формируем результат
    const items = comments.map((comment) => {
      return {
        ...CommentViewDto.mapToView(comment),
        likesInfo: {
          likesCount: comment.likesCount || 0,
          dislikesCount: comment.dislikesCount || 0,
          myStatus: comment.myStatus || 'None',
        },
      };
    });

    return PaginatedViewDto.mapToView({
      page: query.pageNumber,
      size: query.pageSize,
      totalCount,
      items,
    });
  }
}
