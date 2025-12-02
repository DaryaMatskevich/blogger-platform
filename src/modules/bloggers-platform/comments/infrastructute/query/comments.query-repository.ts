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

    return CommentViewDto.mapToView(comment);
  }

  async getByIdWithStatusOrNotFoundFail(
    commentId: string,
    myStatus: string,
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

    return CommentViewDto.mapToViewWithStatus(comment, myStatus);
  }

  async getCommentsForPost(
    query: GetCommentsQueryParams,
    postId: string,
    userId: string | null = null,
  ): Promise<PaginatedViewDto<CommentViewDto[]>> {
    // Базовый запрос для комментариев
    const commentsQuery = `
      SELECT 
        c.*,
        u.login as "userLogin"
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

    const commentsIds = comments.map((c) => c.id);

    // Получаем статусы пользователя, если userId передан
    let userStatuses: any[] = [];
    let userStatusMap = new Map();

    if (userId) {
      const userStatusQuery = `
        SELECT "commentId", status 
        FROM like_comments 
        WHERE "userId" = $1 AND "commentId" = ANY($2::uuid[])
      `;
      userStatuses = await this.dataSource.query(userStatusQuery, [
        userId,
        commentsIds,
      ]);
      userStatusMap = new Map(
        userStatuses.map((status) => [status.commentId, status.status]),
      );
    }

    // Получаем количество лайков и дизлайков
    const likesQuery = `
      SELECT 
        "commentId",
        COUNT(*) as count
      FROM like_comments 
      WHERE "commentId" = ANY($1::uuid[]) AND status = 'Like'
      GROUP BY "commentId"
    `;

    const dislikesQuery = `
      SELECT 
        "commentId",
        COUNT(*) as count
      FROM like_comments 
      WHERE "commentId" = ANY($1::uuid[]) AND status = 'Dislike'
      GROUP BY "commentId"
    `;

    const [likesAggregation, dislikesAggregation] = await Promise.all([
      this.dataSource.query(likesQuery, [commentsIds]),
      this.dataSource.query(dislikesQuery, [commentsIds]),
    ]);

    // Создаем мапы для быстрого доступа
    const likesMap = new Map(
      likesAggregation.map((item) => [item.commentId, parseInt(item.count)]),
    );
    const dislikesMap = new Map(
      dislikesAggregation.map((item) => [item.commentId, parseInt(item.count)]),
    );

    // Получаем общее количество комментариев для пагинации
    const countQuery = `
      SELECT COUNT(*) 
      FROM comments 
      WHERE "deletedAt" IS NULL AND "postId" = $1
    `;
    const countResult = await this.dataSource.query(countQuery, [postId]);
    const totalCount = parseInt(countResult[0].count);

    // Формируем результат
    const items = comments.map((comment) => {
      const commentId = comment.id;

      return {
        ...CommentViewDto.mapToView(comment),
        likesInfo: {
          likesCount: likesMap.get(commentId) || 0,
          dislikesCount: dislikesMap.get(commentId) || 0,
          myStatus: userStatusMap.get(commentId) || 'None',
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

  // Альтернативная версия с одним запросом для получения всей статистики
  async getCommentsForPostOptimized(
    query: GetCommentsQueryParams,
    postId: string,
    userId: string | null = null,
  ): Promise<PaginatedViewDto<CommentViewDto[]>> {
    const commentsQuery = `
      SELECT 
        c.*,
        u.login as "userLogin",
        COALESCE(l.likes_count, 0) as "likesCount",
        COALESCE(d.dislikes_count, 0) as "dislikesCount",
        COALESCE(us.status, 'None') as "myStatus"
      FROM comments c
      LEFT JOIN users u ON c."userId" = u.id
      LEFT JOIN (
        SELECT "commentId", COUNT(*) as likes_count
        FROM like_comments 
        WHERE status = 'Like'
        GROUP BY "commentId"
      ) l ON c.id = l."commentId"
      LEFT JOIN (
        SELECT "commentId", COUNT(*) as dislikes_count
        FROM like_comments 
        WHERE status = 'Dislike'
        GROUP BY "commentId"
      ) d ON c.id = d."commentId"
      LEFT JOIN like_comments us ON c.id = us."commentId" AND us."userId" = $2
      WHERE c."deletedAt" IS NULL AND c."postId" = $1
      ORDER BY c."${query.sortBy}" ${query.sortDirection}
      LIMIT $3 OFFSET $4
    `;

    const comments = await this.dataSource.query(commentsQuery, [
      postId,
      userId,
      query.pageSize,
      query.calculateSkip(),
    ]);

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
        likesCount: parseInt(comment.likesCount),
        dislikesCount: parseInt(comment.dislikesCount),
        myStatus: comment.myStatus,
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
