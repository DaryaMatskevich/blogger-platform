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
        WITH post_data AS (
            SELECT
                p.id,
                p.title,
                p."shortDescription",
                p.content,
                p."blogId",
                p."blogName",
                p."createdAt",
                -- Количество лайков
                COALESCE(
                        (SELECT COUNT(*)
                         FROM "postLikes" pl
                         WHERE pl."postId" = p.id AND pl.status = 'Like'),
                        0
                ) as "likesCount",
                -- Количество дизлайков
                COALESCE(
                        (SELECT COUNT(*)
                         FROM "postLikes" pl
                         WHERE pl."postId" = p.id AND pl.status = 'Dislike'),
                        0
                ) as "dislikesCount"
            FROM "posts" p
            WHERE p.id = $1
              AND p."deletedAt" IS NULL
        ),
             newest_likes AS (
                 SELECT
                     pl."postId",
                     JSON_AGG(
                             JSON_BUILD_OBJECT(
                                     'addedAt', pl."createdAt",
                                     'userId', pl."userId"::text,
                                     'login', u.login
                             )
                                 ORDER BY pl."createdAt" DESC
                     ) as "newestLikes"
                 FROM "postLikes" pl
                          INNER JOIN "users" u ON pl."userId" = u.id
                 WHERE pl."postId" = $1
                   AND pl.status = 'Like'
                 GROUP BY pl."postId"
             )
        SELECT
            pd.*,
            COALESCE(nl."newestLikes", '[]') as "newestLikes"
        FROM post_data pd
                 LEFT JOIN newest_likes nl ON pd.id = nl."postId"
    `;

    const result = await this.dataSource.query(query, [postId]);

    if (result.length === 0) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Post not found',
      });
    }

    const post = result[0];

    // Ограничиваем newestLikes до 3 элементов
    const newestLikes = post.newestLikes.slice(0, 3);

    return PostViewDto.mapToView({
      id: post.id,
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        likesCount: parseInt(post.likesCount),
        dislikesCount: parseInt(post.dislikesCount),
        myStatus: 'None', // Для неавторизованного всегда 'None'
        newestLikes: newestLikes,
      },
    });
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
    postId: number,
    userId: number,
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
        p."updatedAt"
       
      FROM posts p
      WHERE p.id = $1 AND p."deletedAt" IS NULL
    `;

    const postResult = await this.dataSource.query(query, [postId]);

    if (postResult.length === 0) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Post not found',
      });
    }
    const post = postResult[0];
    // 2. Затем получаем информацию о лайках
    const likesCount = await this.dataSource.query(
      `SELECT COUNT(*) as count FROM "postLikes" WHERE "postId" = $1 AND status = 'Like'`,
      [postId],
    );

    const dislikesCount = await this.dataSource.query(
      `SELECT COUNT(*) as count FROM "postLikes" WHERE "postId" = $1 AND status = 'Dislike'`,
      [postId],
    );

    // 3. Статус текущего пользователя
    let myStatus = 'None';
    if (userId) {
      const userStatus = await this.dataSource.query(
        `SELECT status FROM "postLikes" WHERE "postId" = $1 AND "userId" = $2`,
        [postId, userId],
      );
      myStatus = userStatus[0]?.status || 'None';
    }

    // 4. Последние 3 лайка
    const newestLikes = await this.dataSource.query(
      `SELECT
         pl."createdAt",
         pl."userId",
         u.login
       FROM "postLikes" pl
              LEFT JOIN users u ON u.id = pl."userId"
       WHERE pl."postId" = $1 AND pl.status = 'Like'
       ORDER BY pl."createdAt" DESC
         LIMIT 3`,
      [postId],
    );

    // 5. Собираем все вместе
    const postWithLikes = {
      ...post,
      extendedLikesInfo: {
        likesCount: parseInt(likesCount[0]?.count) || 0,
        dislikesCount: parseInt(dislikesCount[0]?.count) || 0,
        myStatus,
        newestLikes: newestLikes.map((like) => ({
          addedAt: like.createdAt, // исправлено: createdAt -> addedAt
          userId: like.userId?.toString() || '', // безопасное преобразование
          login: like.login || '', // если login может быть null
        })),
      },
    };

    return PostViewDto.mapToView(postWithLikes);
  }

  async getAll(
    query: GetPostsQueryParams,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
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

    // Получаем ID всех постов
    const postIds = posts.map((post) => post.id);

    // Запрос для получения информации о лайках - ИСПРАВЛЕНО: type -> status
    const likesInfoQuery = `
        SELECT
            pl."postId",
            -- Статистика лайков/дизлайков
            COUNT(CASE WHEN pl.status = 'Like' THEN 1 END) as "likesCount",
            COUNT(CASE WHEN pl.status = 'Dislike' THEN 1 END) as "dislikesCount",
            -- Три последних лайка
            COALESCE(
                    JSON_AGG(
                            CASE
                                WHEN pl.status = 'Like'
                                    THEN JSON_BUILD_OBJECT(
                                        'addedAt', pl."createdAt",
                                        'userId', pl."userId",
                                        'login', u.login
                                         )
                                ELSE NULL
                                END
                                ORDER BY pl."createdAt" DESC
                    ) FILTER (WHERE pl.status = 'Like'),
                    '[]'::json
            ) as "newestLikesRaw"
        FROM "postLikes" pl
                 LEFT JOIN users u ON pl."userId" = u.id
        WHERE pl."postId" = ANY($1::int[])
        GROUP BY pl."postId"
    `;

    const likesInfoResult = await this.dataSource.query(likesInfoQuery, [
      postIds,
    ]);

    // Создаем мап для быстрого доступа к информации о лайках
    const likesInfoMap = new Map();
    likesInfoResult.forEach((row) => {
      // Обрабатываем newestLikes: берем только 3 последних
      let newestLikes = [];
      if (row.newestLikesRaw) {
        // Фильтруем null значения
        newestLikes = row.newestLikesRaw
          .filter((like) => like !== null && like.userId !== null)
          .slice(0, 3); // Уже отсортированы в ORDER BY
      }

      likesInfoMap.set(row.postId, {
        likesCount: parseInt(row.likesCount) || 0,
        dislikesCount: parseInt(row.dislikesCount) || 0,
        myStatus: 'None',
        newestLikes: newestLikes,
      });
    });

    // Формируем посты с информацией о лайках
    const items: PostViewDto[] = [];
    for (const post of posts) {
      const likesInfo = likesInfoMap.get(post.id) || {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
        newestLikes: [],
      };

      const postWithLikes = {
        ...post,
        extendedLikesInfo: likesInfo,
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
    userId: number,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    // 1. Получаем посты
    const postsQuery = `
      SELECT
        id,
        title,
        "shortDescription",
        content,
        "blogId",
        "blogName",
        "createdAt",
        "updatedAt"
      FROM posts
      WHERE "deletedAt" IS NULL
      ORDER BY "${query.sortBy}" ${query.sortDirection.toString() === 'asc' ? 'ASC' : 'DESC'}
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

    // 2. Для каждого поста отдельно получаем информацию о лайках
    const items: PostViewDto[] = [];

    for (const post of posts) {
      const postId = post.id;

      // Получаем количество лайков
      const likesCount = await this.dataSource.query(
        `SELECT COUNT(*) as count FROM "postLikes" WHERE "postId" = $1 AND status = 'Like'`,
        [postId],
      );

      // Получаем количество дизлайков
      const dislikesCount = await this.dataSource.query(
        `SELECT COUNT(*) as count FROM "postLikes" WHERE "postId" = $1 AND status = 'Dislike'`,
        [postId],
      );

      // Статус текущего пользователя
      let myStatus = 'None';
      if (userId) {
        const userStatus = await this.dataSource.query(
          `SELECT status FROM "postLikes" WHERE "postId" = $1 AND "userId" = $2`,
          [postId, userId],
        );
        myStatus = userStatus[0]?.status || 'None';
      }

      // Последние 3 лайка
      const newestLikes = await this.dataSource.query(
        `SELECT
         pl."createdAt",
         pl."userId",
         u.login
       FROM "postLikes" pl
              LEFT JOIN users u ON u.id = pl."userId"
       WHERE pl."postId" = $1 AND pl.status = 'Like'
       ORDER BY pl."createdAt" DESC
         LIMIT 3`,
        [postId],
      );

      // Собираем пост с лайками
      const postWithLikes = {
        ...post,
        extendedLikesInfo: {
          likesCount: parseInt(likesCount[0]?.count) || 0,
          dislikesCount: parseInt(dislikesCount[0]?.count) || 0,
          myStatus,
          newestLikes: newestLikes.map((like) => ({
            addedAt: like.createdAt,
            userId: like.userId?.toString() || '',
            login: like.login || '',
          })),
        },
      };

      items.push(PostViewDto.mapToView(postWithLikes));
    }

    // 3. Получаем общее количество постов
    const countQuery = `SELECT COUNT(*) as total FROM posts WHERE "deletedAt" IS NULL`;
    const countResult = await this.dataSource.query(countQuery);
    const totalCount = parseInt(countResult[0].total);

    // 4. Возвращаем результат
    return PaginatedViewDto.mapToView({
      page: query.pageNumber,
      size: query.pageSize,
      totalCount,
      items,
    });
  }

  async getAllforBlogwithLikeStatus(
    query: GetPostsQueryParams,
    blogId: number,
    userId: number,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    // 1. Получаем посты
    const postsQuery = `
      SELECT
        id,
        title,
        "shortDescription",
        content,
        "blogId",
        "blogName",
        "createdAt",
        "updatedAt"
      FROM posts
      WHERE "blogId" = $1 and "deletedAt" IS NULL
      ORDER BY "${query.sortBy}" ${query.sortDirection.toString() === 'asc' ? 'ASC' : 'DESC'}
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

    // 2. Для каждого поста отдельно получаем информацию о лайках
    const items: PostViewDto[] = [];

    for (const post of posts) {
      const postId = post.id;

      // Получаем количество лайков
      const likesCount = await this.dataSource.query(
        `SELECT COUNT(*) as count FROM "postLikes" WHERE "postId" = $1 AND status = 'Like'`,
        [postId],
      );

      // Получаем количество дизлайков
      const dislikesCount = await this.dataSource.query(
        `SELECT COUNT(*) as count FROM "postLikes" WHERE "postId" = $1 AND status = 'Dislike'`,
        [postId],
      );

      // Статус текущего пользователя
      let myStatus = 'None';
      if (userId) {
        const userStatus = await this.dataSource.query(
          `SELECT status FROM "postLikes" WHERE "postId" = $1 AND "userId" = $2`,
          [postId, userId],
        );
        myStatus = userStatus[0]?.status || 'None';
      }

      // Последние 3 лайка
      const newestLikes = await this.dataSource.query(
        `SELECT
         pl."createdAt",
         pl."userId",
         u.login
       FROM "postLikes" pl
              LEFT JOIN users u ON u.id = pl."userId"
       WHERE pl."postId" = $1 AND pl.status = 'Like'
       ORDER BY pl."createdAt" DESC
         LIMIT 3`,
        [postId],
      );

      // Собираем пост с лайками
      const postWithLikes = {
        ...post,
        extendedLikesInfo: {
          likesCount: parseInt(likesCount[0]?.count) || 0,
          dislikesCount: parseInt(dislikesCount[0]?.count) || 0,
          myStatus,
          newestLikes: newestLikes.map((like) => ({
            addedAt: like.createdAt,
            userId: like.userId?.toString() || '',
            login: like.login || '',
          })),
        },
      };

      items.push(PostViewDto.mapToView(postWithLikes));
    }

    // 3. Получаем общее количество постов
    const countQuery = `SELECT COUNT(*) as total FROM posts WHERE "deletedAt" IS NULL`;
    const countResult = await this.dataSource.query(countQuery);
    const totalCount = parseInt(countResult[0].total);

    // 4. Возвращаем результат
    return PaginatedViewDto.mapToView({
      page: query.pageNumber,
      size: query.pageSize,
      totalCount,
      items,
    });
  }

  async getPostsForBlogWithLikeStatus(
    query: GetPostsQueryParams,
    blogId: number,
    userId: number,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
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
      blogId,
      query.pageSize,
      query.calculateSkip(),
    ]);

    if (posts.length === 0) {
      const countQuery = `
          SELECT COUNT(*) as total
          FROM posts p
          WHERE p."deletedAt" IS NULL AND p."blogId" = $1
      `;
      const countResult = await this.dataSource.query(countQuery, [blogId]);
      const totalCount = parseInt(countResult[0].total, 10);

      return PaginatedViewDto.mapToView({
        page: query.pageNumber,
        size: query.pageSize,
        totalCount,
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
    const countResult = await this.dataSource.query(countQuery, [blogId]);
    const totalCount = parseInt(countResult[0].total, 10);

    return PaginatedViewDto.mapToView<PostViewDto[]>({
      page: query.pageNumber,
      size: query.pageSize,
      totalCount,
      items,
    });
  }

  private async getPostWithLikesInfo(post: any, userId: number): Promise<any> {
    const postId = post.id;

    // 1. Количество лайков
    const likesResult = await this.dataSource.query(
      `SELECT COUNT(*) as count FROM "postLikes" WHERE "postId" = $1 AND status = 'Like'`,
      [postId],
    );
    const likesCount = parseInt(likesResult[0]?.count) || 0;

    // 2. Количество дизлайков
    const dislikesResult = await this.dataSource.query(
      `SELECT COUNT(*) as count FROM "postLikes" WHERE "postId" = $1 AND status = 'Dislike'`,
      [postId],
    );
    const dislikesCount = parseInt(dislikesResult[0]?.count) || 0;

    // 3. Статус текущего пользователя
    let myStatus = 'None';
    if (userId) {
      const userStatusResult = await this.dataSource.query(
        `SELECT status FROM "postLikes" WHERE "postId" = $1 AND "userId" = $2`,
        [postId, userId],
      );
      myStatus = userStatusResult[0]?.status || 'None';
    }

    // 4. Последние 3 лайка - ВАЖНО: добавлен JOIN с users!
    const newestLikesResult = await this.dataSource.query(
      `SELECT
           pl."createdAt" as "addedAt",
           pl."userId",
           u.login  -- Теперь login будет правильно получен
       FROM "postLikes" pl
                LEFT JOIN users u ON u.id = pl."userId"  -- ← ДОБАВЛЕН JOIN!
       WHERE pl."postId" = $1 AND pl.status = 'Like'
       ORDER BY pl."createdAt" DESC
           LIMIT 3`,
      [postId],
    );

    const newestLikes = newestLikesResult.map((like) => ({
      addedAt: like.addedAt,
      userId: like.userId.toString(),
      login: like.login, // Теперь здесь будет реальный login из таблицы users
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

  async getPostsForBlogWithoutUserStatus(
    query: GetPostsQueryParams,
    blogId: number,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
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
      blogId,
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
      const postWithLikes =
        await this.getPostWithLikesInfoForUnauthorized(post);
      items.push(PostViewDto.mapToView(postWithLikes));
    }

    // Получаем общее количество для блога
    const countQuery = `
    SELECT COUNT(*) as total
    FROM posts p
    WHERE p."deletedAt" IS NULL AND p."blogId" = $1
  `;
    const countResult = await this.dataSource.query(countQuery, [blogId]);
    const totalCount = parseInt(countResult[0].total, 10);

    return PaginatedViewDto.mapToView<PostViewDto[]>({
      page: query.pageNumber,
      size: query.pageSize,
      totalCount,
      items,
    });
  }

  private async getPostWithLikesInfoForUnauthorized(post: any): Promise<any> {
    const postId = post.id;

    // 1. Количество лайков
    const likesResult = await this.dataSource.query(
      `SELECT COUNT(*) as count FROM "postLikes" WHERE "postId" = $1 AND status = 'Like'`,
      [postId],
    );
    const likesCount = parseInt(likesResult[0]?.count) || 0;

    // 2. Количество дизлайков
    const dislikesResult = await this.dataSource.query(
      `SELECT COUNT(*) as count FROM "postLikes" WHERE "postId" = $1 AND status = 'Dislike'`,
      [postId],
    );
    const dislikesCount = parseInt(dislikesResult[0]?.count) || 0;

    // 3. Статус текущего пользователя - всегда 'None' для неавторизованных
    const myStatus = 'None';

    // 4. Последние 3 лайка
    const newestLikesResult = await this.dataSource.query(
      `SELECT 
      pl."createdAt" as "addedAt", 
      pl."userId", 
      u.login 
     FROM "postLikes" pl
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
