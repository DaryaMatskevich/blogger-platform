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

  async getCommentsForPostwithStatus(
    query: GetCommentsQueryParams,
    postId: number,
    userId: number,
  ): Promise<PaginatedViewDto<CommentViewDto[]>> {
    // Базовый запрос с подсчетом лайков
    const commentsQuery = `
      SELECT
        c.*,
        u.login as "userLogin",
        -- Подсчет лайков
        COALESCE(like_counts.likes, 0) as "likesCount",
        COALESCE(like_counts.dislikes, 0) as "dislikesCount",
        -- Статус текущего пользователя (если авторизован)
        ${
          userId
            ? `COALESCE(
              (SELECT cl.status 
               FROM "commentLikes" cl 
               WHERE cl."commentId" = c.id AND cl."userId" = $2
               LIMIT 1
              ), 'None'
            ) as "myStatus"`
            : `'None' as "myStatus"`
        }
      FROM comments c
             LEFT JOIN users u ON c."userId" = u.id
             LEFT JOIN (
        -- Агрегация лайков по комментариям
        SELECT
          "commentId",
          COUNT(CASE WHEN status = 'Like' THEN 1 END) as likes,
          COUNT(CASE WHEN status = 'Dislike' THEN 1 END) as dislikes
        FROM "commentLikes"
        GROUP BY "commentId"
      ) like_counts ON like_counts."commentId" = c.id
      WHERE c."deletedAt" IS NULL
        AND c."postId" = $1
      ORDER BY c."${query.sortBy}" ${query.sortDirection}
    LIMIT $3 OFFSET $4
    `;

    const params = userId
      ? [postId, userId, query.pageSize, query.calculateSkip()]
      : [postId, query.pageSize, query.calculateSkip()];

    const comments = await this.dataSource.query(commentsQuery, params);

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
    const items = comments.map((comment) => ({
      ...CommentViewDto.mapToView(comment),
      likesInfo: {
        likesCount: Number(comment.likesCount) || 0,
        dislikesCount: Number(comment.dislikesCount) || 0,
        myStatus: comment.myStatus || 'None',
      },
    }));

    return PaginatedViewDto.mapToView({
      page: query.pageNumber,
      size: query.pageSize,
      totalCount,
      items,
    });
  }
  async getCommentsForPostWithoutUserStatus(
    query: GetCommentsQueryParams,
    postId: number,
  ): Promise<PaginatedViewDto<CommentViewDto[]>> {
    const commentsQuery = `
    SELECT 
      c.*,
      u.login as "userLogin",
      -- Только подсчет лайков, без статуса пользователя
      COALESCE(like_counts.likes, 0) as "likesCount",
      COALESCE(like_counts.dislikes, 0) as "dislikesCount"
    FROM comments c
    LEFT JOIN users u ON c."userId" = u.id
    LEFT JOIN (
      SELECT 
        "commentId",
        COUNT(CASE WHEN status = 'Like' THEN 1 END) as likes,
        COUNT(CASE WHEN status = 'Dislike' THEN 1 END) as dislikes
      FROM "commentLikes"
      GROUP BY "commentId"
    ) like_counts ON like_counts."commentId" = c.id
    WHERE c."deletedAt" IS NULL 
      AND c."postId" = $1
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

    // Формируем результат - всегда 'None' для myStatus
    const items = comments.map((comment) => ({
      ...CommentViewDto.mapToView(comment),
      likesInfo: {
        likesCount: Number(comment.likesCount) || 0,
        dislikesCount: Number(comment.dislikesCount) || 0,
        myStatus: 'None' as const, // Всегда 'None' для неавторизованных
      },
    }));

    return PaginatedViewDto.mapToView({
      page: query.pageNumber,
      size: query.pageSize,
      totalCount,
      items,
    });
  }
}
