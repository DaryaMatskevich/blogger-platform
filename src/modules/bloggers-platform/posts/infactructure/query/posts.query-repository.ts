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
        SELECT p.id,
               p.title,
               p."shortDescription",
               p.content,
               p."blogId",
               p."blogName",
               p."createdAt",
               p."updatedAt"
        FROM posts p
        WHERE p.id = $1
          AND p."deletedAt" IS NULL
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
  async existsByIdAndBlogId(postId: number, blogId: number): Promise<boolean> {
    const query = `
    SELECT EXISTS(
      SELECT 1 FROM posts 
      WHERE id = $1 AND "blogId" = $2 AND "deletedAt" IS NULL
    ) as exists
  `;

    const result = await this.dataSource.query(query, [postId, blogId]);
    return result[0].exists;
  }

  async existsById(postId: number): Promise<boolean> {
    const query = `
    SELECT EXISTS(
      SELECT 1 FROM posts 
      WHERE id = $1 AND "deletedAt" IS NULL
    ) as exists
  `;

    const result = await this.dataSource.query(query, [postId]);
    return result[0].exists;
  }

  async getByIdWithStatusOrNotFoundFail(
    postId: string,
    userId: string | null,
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
       
      FROM posts p
      WHERE p.id = $1 AND p."deletedAt" IS NULL
    `;

    const postResult = await this.dataSource.query(query, [
      parseInt(postId, 10),
    ]);

    if (postResult.length === 0) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Post not found',
      });
    }
    const post = postResult[0];
    // 2. Затем получаем информацию о лайках
    const likesCount = await this.dataSource.query(
      `SELECT COUNT(*) as count FROM postLikes WHERE "postId" = $1 AND status = 'Like'`,
      [parseInt(postId, 10)],
    );

    const dislikesCount = await this.dataSource.query(
      `SELECT COUNT(*) as count FROM postLikes WHERE "postId" = $1 AND status = 'Dislike'`,
      [parseInt(postId, 10)],
    );

    // 3. Статус текущего пользователя
    let myStatus = 'None';
    if (userId) {
      const userStatus = await this.dataSource.query(
        `SELECT status FROM postLikes WHERE "postId" = $1 AND "userId" = $2`,
        [parseInt(postId, 10), parseInt(userId, 10)],
      );
      myStatus = userStatus[0]?.status || 'None';
    }

    // 4. Последние 3 лайка
    const newestLikes = await this.dataSource.query(
      `SELECT
           pl."createdAt" as "addedAt",
           pl."userId",
           u.login
       FROM postLikes pl
                LEFT JOIN users u ON u.id = pl."userId"
       WHERE pl."postId" = $1 AND pl.status = 'Like'
       ORDER BY pl."createdAt" DESC
           LIMIT 3`,
      [parseInt(postId, 10)],
    );

    // 5. Собираем все вместе
    const postWithLikes = {
      ...post,
      extendedLikesInfo: {
        likesCount: parseInt(likesCount[0]?.count) || 0,
        dislikesCount: parseInt(dislikesCount[0]?.count) || 0,
        myStatus,
        newestLikes: newestLikes.map((like) => ({
          addedAt: like.addedAt,
          userId: like.userId.toString(),
          login: like.login,
        })),
      },
    };

    return PostViewDto.mapToView(postWithLikes);
  }

  async getAll(
    query: GetPostsQueryParams,
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
      p."updatedAt"
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

    // Для каждого поста добавляем заглушку лайков
    const items: PostViewDto[] = [];
    for (const post of posts) {
      const extendedLikesInfo = {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
        newestLikes: [],
      };

      const postWithLikes = {
        ...post,
        extendedLikesInfo,
      };

      items.push(PostViewDto.mapToView(postWithLikes));
    }

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

  async getAllwithLikeStatus(
    query: GetPostsQueryParams,
    userId: string | null,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    // Базовый запрос для постов (БЕЗ extendedLikesInfo)
    const postsQuery = `
    SELECT 
      p.id,
      p.title,
      p."shortDescription",
      p.content,
      p."blogId",
      p."blogName",
      p."createdAt",
      p."updatedAt"
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

    // Для каждого поста получаем информацию о лайках
    const items: PostViewDto[] = [];
    for (const post of posts) {
      const postWithLikes = await this.getPostWithLikesInfo(post, userId);
      items.push(PostViewDto.mapToView(postWithLikes));
    }

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
      p."updatedAt"
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

    // Для каждого поста добавляем заглушку лайков
    const items: PostViewDto[] = [];
    for (const post of posts) {
      const extendedLikesInfo = {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
        newestLikes: [],
      };

      const postWithLikes = {
        ...post,
        extendedLikesInfo,
      };

      items.push(PostViewDto.mapToView(postWithLikes));
    }

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

  async getPostsForBlogWithLikeStatus(
    query: GetPostsQueryParams,
    blogId: string,
    userId: string | null,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    const blogIdNum = parseInt(blogId, 10);

    // Базовый запрос для постов блога (БЕЗ extendedLikesInfo)
    const postsQuery = `
        SELECT
            p.id,
            p.title,
            p."shortDescription",
            p.content,
            p."blogId",
            p."blogName",
            p."createdAt",
            p."updatedAt"
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

    // Для каждого поста получаем информацию о лайках
    const items: PostViewDto[] = [];
    for (const post of posts) {
      const postWithLikes = await this.getPostWithLikesInfo(post, userId);
      items.push(PostViewDto.mapToView(postWithLikes));
    }

    // Получаем общее количество для блога
    const countQuery = `
        SELECT COUNT(*) as total
        FROM posts p
        WHERE p."deletedAt" IS NULL AND p."blogId" = $1
    `;
    const countResult = await this.dataSource.query(countQuery, [blogIdNum]);
    const totalCount = parseInt(countResult[0].total, 10);

    return PaginatedViewDto.mapToView<PostViewDto[]>({
      page: query.pageNumber,
      size: query.pageSize,
      totalCount,
      items,
    });
  }

  private async getPostWithLikesInfo(
    post: any,
    userId: string | null,
  ): Promise<any> {
    const postId = post.id;

    // 1. Количество лайков
    const likesResult = await this.dataSource.query(
      `SELECT COUNT(*) as count FROM postLikes WHERE "postId" = $1 AND status = 'Like'`,
      [postId],
    );
    const likesCount = parseInt(likesResult[0]?.count) || 0;

    // 2. Количество дизлайков
    const dislikesResult = await this.dataSource.query(
      `SELECT COUNT(*) as count FROM postLikes WHERE "postId" = $1 AND status = 'Dislike'`,
      [postId],
    );
    const dislikesCount = parseInt(dislikesResult[0]?.count) || 0;

    // 3. Статус текущего пользователя
    let myStatus = 'None';
    if (userId) {
      const userStatusResult = await this.dataSource.query(
        `SELECT status FROM postLikes WHERE "postId" = $1 AND "userId" = $2`,
        [postId, parseInt(userId, 10)],
      );
      myStatus = userStatusResult[0]?.status || 'None';
    }

    // 4. Последние 3 лайка
    const newestLikesResult = await this.dataSource.query(
      `SELECT 
      pl."createdAt" as "addedAt", 
      pl."userId", 
      u.login 
     FROM postLikes pl
     LEFT JOIN users u ON u.id = pl."userId"
     WHERE pl."postId" = $1 AND pl.status = 'Like' 
     ORDER BY pl."createdAt" DESC 
     LIMIT 3`,
      [postId],
    );

    const newestLikes = newestLikesResult.map((like) => ({
      addedAt: like.addedAt,
      userId: like.userId.toString(),
      login: like.login,
    }));

    // 5. Собираем пост с информацией о лайках
    return {
      ...post,
      extendedLikesInfo: {
        likesCount,
        dislikesCount,
        myStatus,
        newestLikes,
      },
    };
  }
}
