import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view.dto';
import { PostViewDto } from '../../api/view-dto/posts.view-dto';
import { GetPostsQueryParams } from '../../api/input-dto/get-posts-query-params.input-dto';
import { DomainExceptionCode } from '../../../../../core/exeptions/domain-exeption-codes';
import { DomainException } from '../../../../../core/exeptions/domain-exeptions';

@Injectable()
export class PostsQueryRepository {
  constructor(private dataSource: DataSource) {}

  async getByIdOrNotFoundFail(postId: number): Promise<PostViewDto> {
    const query = `
      SELECT 
        p.id,
        p.title,
        p."shortDescription",
        p.content,
        p."blogId",
        p."blogName",
        p."createdAt",
        p."updatedAt",
        p."extendedLikesInfo"
      FROM posts p
      WHERE p.id = $1 AND p."deletedAt" IS NULL
    `;

    const result = await this.dataSource.query(query, [postId]);

    if (result.length === 0) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Post not found',
      });
    }

    return PostViewDto.mapToView(result[0]);
  }

  async getByIdWithStatusOrNotFoundFail(
    postId: string,
    myStatus: string,
  ): Promise<PostViewDto> {
    const query = `
      SELECT 
        p.id,
        p.title,
        p."shortDescription",
        p.content,
        p."blogId",
        p."blogName",
        p."createdAt",
        p."updatedAt",
        p."extendedLikesInfo"
      FROM posts p
      WHERE p.id = $1 AND p."deletedAt" IS NULL
    `;

    const result = await this.dataSource.query(query, [parseInt(postId, 10)]);

    if (result.length === 0) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Post not found',
      });
    }

    return PostViewDto.mapToViewWithStatus(result[0], myStatus);
  }

  async getAll(
    query: GetPostsQueryParams,
    userId: string | null,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    // Базовый запрос для постов
    const postsQuery = `
      SELECT 
        p.id,
        p.title,
        p."shortDescription",
        p.content,
        p."blogId",
        p."blogName",
        p."createdAt",
        p."updatedAt",
        p."extendedLikesInfo"
      FROM posts p
      WHERE p."deletedAt" IS NULL
      ORDER BY p."${query.sortBy}" ${query.sortDirection.toString() === 'asc' ? 'ASC' : 'DESC'}
      LIMIT $1 OFFSET $2
    `;

    const posts = await this.dataSource.query(postsQuery, [
      query.pageSize,
      query.calculateSkip(),
    ]);

    if (posts.length === 0) {
      return PaginatedViewDto.mapToView({
        page: query.pageNumber,
        size: query.pageSize,
        totalCount: 0,
        items: [],
      });
    }

    const postIds = posts.map((p) => p.id);
    const items = await this.getPostsWithLikesInfo(posts, postIds, userId);

    // Получаем общее количество
    const countQuery = `
      SELECT COUNT(*) as total
      FROM posts p
      WHERE p."deletedAt" IS NULL
    `;
    const countResult = await this.dataSource.query(countQuery);
    const totalCount = parseInt(countResult[0].total, 10);

    return PaginatedViewDto.mapToView({
      page: query.pageNumber,
      size: query.pageSize,
      totalCount,
      items,
    });
  }

  async getPostsForBlog(
    query: GetPostsQueryParams,
    blogId: string,
    userId: string | null,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    const blogIdNum = parseInt(blogId, 10);

    // Базовый запрос для постов блога
    const postsQuery = `
      SELECT 
        p.id,
        p.title,
        p."shortDescription",
        p.content,
        p."blogId",
        p."blogName",
        p."createdAt",
        p."updatedAt",
        p."extendedLikesInfo"
      FROM posts p
      WHERE p."deletedAt" IS NULL AND p."blogId" = $1
      ORDER BY p."${query.sortBy}" ${query.sortDirection.toString() === 'asc' ? 'ASC' : 'DESC'}
      LIMIT $2 OFFSET $3
    `;

    const posts = await this.dataSource.query(postsQuery, [
      blogIdNum,
      query.pageSize,
      query.calculateSkip(),
    ]);

    if (posts.length === 0) {
      return PaginatedViewDto.mapToView({
        page: query.pageNumber,
        size: query.pageSize,
        totalCount: 0,
        items: [],
      });
    }

    const postIds = posts.map((p) => p.id);
    const items = await this.getPostsWithLikesInfo(posts, postIds, userId);

    // Получаем общее количество для блога
    const countQuery = `
      SELECT COUNT(*) as total
      FROM posts p
      WHERE p."deletedAt" IS NULL AND p."blogId" = $1
    `;
    const countResult = await this.dataSource.query(countQuery, [blogIdNum]);
    const totalCount = parseInt(countResult[0].total, 10);

    return PaginatedViewDto.mapToView({
      page: query.pageNumber,
      size: query.pageSize,
      totalCount,
      items,
    });
  }

  private async getPostsWithLikesInfo(
    posts: any[],
    postIds: number[],
    userId: string | null,
  ): Promise<PostViewDto[]> {
    if (postIds.length === 0) return [];

    // Получаем статусы текущего пользователя
    let userStatusMap = new Map();
    if (userId) {
      const userStatusQuery = `
        SELECT post_id, status 
        FROM post_likes 
        WHERE user_id = $1 AND post_id = ANY($2::int[])
      `;
      const userStatuses = await this.dataSource.query(userStatusQuery, [
        userId,
        postIds,
      ]);
      userStatusMap = new Map(
        userStatuses.map((status) => [status.post_id, status.status]),
      );
    }

    // Получаем количество лайков и последние лайки
    const likesQuery = `
      WITH ranked_likes AS (
        SELECT 
          post_id,
          added_at,
          user_id,
          login,
          ROW_NUMBER() OVER (PARTITION BY post_id ORDER BY added_at DESC) as rn
        FROM post_likes 
        WHERE post_id = ANY($1::int[]) AND status = 'Like'
      ),
      likes_count AS (
        SELECT 
          post_id,
          COUNT(*) as likes_count
        FROM post_likes 
        WHERE post_id = ANY($1::int[]) AND status = 'Like'
        GROUP BY post_id
      ),
      dislikes_count AS (
        SELECT 
          post_id,
          COUNT(*) as dislikes_count
        FROM post_likes 
        WHERE post_id = ANY($1::int[]) AND status = 'Dislike'
        GROUP BY post_id
      )
      SELECT 
        lc.post_id,
        lc.likes_count,
        dc.dislikes_count,
        json_agg(
          json_build_object(
            'addedAt', rl.added_at,
            'userId', rl.user_id,
            'login', rl.login
          ) ORDER BY rl.added_at DESC
        ) FILTER (WHERE rl.rn <= 3) as newest_likes
      FROM likes_count lc
      LEFT JOIN dislikes_count dc ON lc.post_id = dc.post_id
      LEFT JOIN ranked_likes rl ON lc.post_id = rl.post_id AND rl.rn <= 3
      GROUP BY lc.post_id, lc.likes_count, dc.dislikes_count
    `;

    const likesResult = await this.dataSource.query(likesQuery, [postIds]);
    const likesMap = new Map(
      likesResult.map((item) => [
        item.post_id,
        {
          likesCount: item.likes_count || 0,
          dislikesCount: item.dislikes_count || 0,
          newestLikes: item.newest_likes || [],
        },
      ]),
    );

    // Формируем элементы для ответа
    return posts.map((post) => {
      const likesInfo =
        likesMap.get(post.id) ||
        ({
          likesCount: 0,
          dislikesCount: 0,
          newestLikes: [],
        } as any);

      return {
        ...PostViewDto.mapToView(post),
        extendedLikesInfo: {
          likesCount: likesInfo.likesCount,
          dislikesCount: likesInfo.dislikesCount,
          myStatus: userStatusMap.get(post.id) || 'None',
          newestLikes: likesInfo.newestLikes,
        },
      };
    });
  }
}
