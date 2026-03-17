import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { PostViewDto } from '../../api/view-dto/posts.view-dto';
import { DomainExceptionCode } from '../../../../../core/exeptions/domain-exeption-codes';
import { DomainException } from '../../../../../core/exeptions/domain-exeptions';
import { PostWithBlogNameDto } from '../../../../../modules/bloggers-platform/posts/dto/postWithBlogNameDto';
import { GetPostsQueryParams } from '../../../../../modules/bloggers-platform/posts/api/input-dto/get-posts-query-params.input-dto';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view.dto';

@Injectable()
export class PostsQueryRepository {
  constructor(private dataSource: DataSource) {}

  async getByIdWhithoutStatusOrNotFoundFail(
    postId: number,
  ): Promise<PostViewDto> {
    // 1. Получаем базовую информацию о посте
    const post = await this.findPostWithBlog(postId);

    // 2. Получаем статистику лайков
    const likesStats = await this.getLikesStats(postId);

    // 3. Получаем последние лайки
    const newestLikes = await this.getNewestLikes(postId);

    // 4. Формируем DTO
    return PostViewDto.mapToView({
      ...post,
      extendedLikesInfo: {
        likesCount: likesStats.likesCount,
        dislikesCount: likesStats.dislikesCount,
        myStatus: 'None',
        newestLikes: newestLikes.slice(0, 3),
      },
    });
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

  async findPostInBlog(postId: number, blogId: number): Promise<boolean> {
    const result = await this.dataSource.query(
      `
        SELECT EXISTS(
          SELECT 1 FROM posts
          WHERE id = $1
            AND "blogId" = $2
            AND "deletedAt" IS NULL
        )
      `,
      [postId, blogId],
    );

    return result[0]?.exists || false;
  }

  async getAllPostsForBlogWithPagination(
    queryParams: GetPostsQueryParams,
    blogId: number,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    const {
      sortBy = 'createdAt',
      sortDirection = 'desc',
      pageNumber = 1,
      pageSize = 10,
    } = queryParams;

    // Валидация sortBy для предотвращения SQL-инъекций
    const validSortFields = [
      'createdAt',
      'title',
      'shortDescription',
      'content',
    ];
    const sortByField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';

    const offset = (pageNumber - 1) * pageSize;

    // Получаем общее количество постов для блога
    const countResult = await this.dataSource.query(
      `
    SELECT COUNT(*) as count
    FROM posts
    WHERE "blogId" = $1 AND "deletedAt" IS NULL
    `,
      [blogId],
    );

    const totalCount = parseInt(countResult[0].count);

    // Получаем посты с пагинацией
    const query = `
    SELECT 
      p.id,
      p.title,
      p."shortDescription",
      p.content,
      p."blogId",
      b.name as "blogName",
      p."createdAt"
    FROM posts p
    INNER JOIN blogs b ON b.id = p."blogId" AND b."deletedAt" IS NULL
    WHERE p."blogId" = $1 AND p."deletedAt" IS NULL
    ORDER BY "${sortByField}" ${sortDirection}
    LIMIT $2 OFFSET $3
  `;

    const posts = await this.dataSource.query(query, [
      blogId,
      pageSize,
      offset,
    ]);

    if (posts.length === 0) {
      return PaginatedViewDto.mapToView({
        items: [],
        totalCount: 0,
        page: pageNumber,
        pageSize,
      });
    }

    // Для каждого поста получаем статистику лайков и последние лайки
    const postsWithLikes = await this.enrichPostsWithLikesInfo(posts);

    return PaginatedViewDto.mapToView({
      items: postsWithLikes,
      totalCount,
      page: pageNumber,
      pageSize,
    });
  }

  async getAllPostsgWithPagination(
    queryParams: GetPostsQueryParams,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    const {
      sortBy = 'createdAt',
      sortDirection = 'desc',
      pageNumber = 1,
      pageSize = 10,
    } = queryParams;

    // Валидация sortBy для предотвращения SQL-инъекций
    const validSortFields = [
      'createdAt',
      'title',
      'shortDescription',
      'content',
    ];
    const sortByField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';

    const offset = (pageNumber - 1) * pageSize;

    // Получаем общее количество всех постов
    const countResult = await this.dataSource.query(
      `
    SELECT COUNT(*) as count
    FROM posts
    WHERE "deletedAt" IS NULL
    `,
    );

    const totalCount = parseInt(countResult[0].count);

    // Получаем все посты с пагинацией
    const query = `
    SELECT 
      p.id,
      p.title,
      p."shortDescription",
      p.content,
      p."blogId",
      b.name as "blogName",
      p."createdAt"
    FROM posts p
    INNER JOIN blogs b ON b.id = p."blogId" AND b."deletedAt" IS NULL
    WHERE p."deletedAt" IS NULL
    ORDER BY "${sortByField}" ${sortDirection}
    LIMIT $1 OFFSET $2
  `;

    const posts = await this.dataSource.query(query, [pageSize, offset]);

    if (posts.length === 0) {
      return PaginatedViewDto.mapToView({
        items: [],
        totalCount: 0,
        page: pageNumber,
        pageSize,
      });
    }

    const postsWithLikes = await this.enrichPostsWithLikesInfo(posts);

    return PaginatedViewDto.mapToView({
      items: postsWithLikes,
      totalCount,
      page: pageNumber,
      pageSize,
    });
  }

  private async enrichPostsWithLikesInfo(posts: any[]): Promise<PostViewDto[]> {
    return Promise.all(
      posts.map(async (post) => {
        const likesStats = await this.getLikesStats(post.id);
        const newestLikes = await this.getNewestLikes(post.id);

        return PostViewDto.mapToView({
          ...post,
          extendedLikesInfo: {
            likesCount: likesStats.likesCount,
            dislikesCount: likesStats.dislikesCount,
            myStatus: 'None',
            newestLikes: newestLikes.slice(0, 3),
          },
        });
      }),
    );
  }

  private async findPostWithBlog(postId: number): Promise<PostWithBlogNameDto> {
    const query = `
      SELECT 
        p.id,
        p.title,
        p."shortDescription",
        p.content,
        p."blogId",
        b.name as "blogName",
        p."createdAt"
      
      FROM posts p
      INNER JOIN blogs b ON b.id = p."blogId" AND b."deletedAt" IS NULL
      WHERE p.id = $1 AND p."deletedAt" IS NULL
    `;

    const result = await this.dataSource.query(query, [postId]);

    if (result.length === 0) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Post not found',
      });
    }

    return result[0];
  }

  private async getLikesStats(postId: number) {
    const query = `
      SELECT 
        COUNT(*) FILTER (WHERE status = 'Like') as "likesCount",
        COUNT(*) FILTER (WHERE status = 'Dislike') as "dislikesCount"
      FROM "postLikes"
      WHERE "postId" = $1 
    `;

    const result = await this.dataSource.query(query, [postId]);
    return {
      likesCount: parseInt(result[0]?.likesCount) || 0,
      dislikesCount: parseInt(result[0]?.dislikesCount) || 0,
    };
  }

  private async getNewestLikes(postId: number) {
    const query = `
        SELECT pl."createdAt" as "addedAt",
               pl."userId",
               u.login
        FROM "postLikes" pl
                 INNER JOIN users u ON u.id = pl."userId"
        WHERE pl."postId" = $1
          AND pl.status = 'Like'
        ORDER BY pl."createdAt" DESC LIMIT 3
    `;

    const result = await this.dataSource.query(query, [postId]);

    return result.map((like) => ({
      addedAt: like.addedAt,
      userId: like.userId.toString(),
      login: like.login,
    }));
  }
}
