import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { FilterQuery, Types } from 'mongoose';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view.dto';
import { Post, PostModelType } from '../../domain/post.entity';
import { PostViewDto } from '../../api/view-dto/posts.view-dto';
import { GetPostsQueryParams } from '../../api/input-dto/get-posts-query-params.input-dto';
import { DomainExceptionCode } from '../../../../../core/exeptions/domain-exeption-codes';
import { DomainException } from '../../../../../core/exeptions/domain-exeptions';
import { LikePost, LikePostModelType } from '../../domain/likes/like.entity';



@Injectable() 
export class PostsQueryRepository {
  constructor(
    @InjectModel(Post.name)
    private PostModel: PostModelType,
    @InjectModel(LikePost.name)
    private LikePostModel: LikePostModelType,
  ) { }

  async getByIdOrNotFoundFail(postId: string): Promise<PostViewDto> {
    const post = await this.PostModel.findOne({
      _id: postId,
      deletedAt: null,
    });

    if (!post) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: "Post not found"
      })
    }

    return PostViewDto.mapToView(post);
  }

  async getByIdWithStatusOrNotFoundFail(postId: string, myStatus: string): Promise<PostViewDto> {
    const post = await this.PostModel.findOne({
      _id: postId,
      deletedAt: null,
    });

    if (!post) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: "Post not found"
      })
    }

    return PostViewDto.mapToViewWithStatus(post, myStatus);
  }



  async getAll(
    query: GetPostsQueryParams,
    userId: string | null
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    const filter: FilterQuery<Post> = {
      deletedAt: null,
    };

    const posts = await this.PostModel.find(filter)
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(query.calculateSkip())
      .limit(query.pageSize);

    const totalCount = await this.PostModel.countDocuments(filter);

     if (posts.length === 0) {
    return PaginatedViewDto.mapToView({
    page: query.pageNumber,
    size: query.pageSize,
    totalCount: 0,
    items: []
  });
    }
const postIds = posts.map(p => p._id.toString());

  // Получаем статусы текущего пользователя
  const userStatuses = userId
    ? await this.LikePostModel.find({
        userId: userId,
        postId: { $in: postIds }
      }).lean()
    : [];

  const userStatusMap = new Map(
    userStatuses.map(status => [
      status.postId,
      status.status
    ])
  );


   const [likesAggregation, dislikesAggregation] = await Promise.all([
    this.LikePostModel.aggregate([
      {
        $match: {
          postId: { $in: postIds },
          status: "Like"
        }
      },
      { $sort: { addedAt: -1 } },
      {
        $group: {
          _id: "$postId",
          likesCount: { $sum: 1 },
          newestLikes: {
            $push: {
              addedAt: "$addedAt",
              userId: "$userId",
              login: "$login"
            }
          }
        }
      },
      {
        $project: {
          likesCount: 1,
          newestLikes: { $slice: ["$newestLikes", 3] }
        }
      }
    ]),
    this.LikePostModel.aggregate([
      {
        $match: {
          postId: { $in: postIds },
          status: "Dislike"
        }
      },
      {
        $group: {
          _id: "$postId",
          dislikesCount: { $sum: 1 }
        }
      }
    ])
  ]);

  // Создаем мапы для быстрого доступа
  const likesMap = new Map(
    likesAggregation.map(item => [
      item._id,
      {
        likesCount: item.likesCount,
        newestLikes: item.newestLikes.map(like => ({
          addedAt: like.addedAt,
          userId: like.userId,
          login: like.login
        }))
      }
    ])
  );

  const dislikesMap = new Map(
    dislikesAggregation.map(item => [
      item._id,
      item.dislikesCount
    ])
  );

  // Формируем элементы для ответа
  const items = posts.map(post => {
    const postId = post._id.toString();

     return {
      ...PostViewDto.mapToView(post),
      extendedLikesInfo: {
        likesCount: likesMap.get(postId)?.likesCount || 0,
        dislikesCount: dislikesMap.get(postId) || 0,
        myStatus: userStatusMap.get(postId) || "None",
        newestLikes: likesMap.get(postId)?.newestLikes || []
      }
    };
  });
  return PaginatedViewDto.mapToView({
    page: query.pageNumber,
    size: query.pageSize,
    totalCount,
    items
  })
}

  async getPostsForBlog(
    query: GetPostsQueryParams, blogId: string, userId: string | null
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    const filter: FilterQuery<Post> = {
      deletedAt: null,
      blogId: blogId
    };

    const posts = await this.PostModel.find(filter)
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(query.calculateSkip())
      .limit(query.pageSize);

const totalCount = await this.PostModel.countDocuments(filter);


    if (posts.length === 0) {
    return PaginatedViewDto.mapToView({
    page: query.pageNumber,
    size: query.pageSize,
    totalCount: 0,
    items: []
  });
    }

   const postIds = posts.map(p => p._id.toString());

  // Получаем статусы текущего пользователя
  const userStatuses = userId
    ? await this.LikePostModel.find({
        userId: userId,
        postId: { $in: postIds }
      }).lean()
    : [];

  const userStatusMap = new Map(
    userStatuses.map(status => [
      status.postId,
      status.status
    ])
  );

  // Выполняем агрегации параллельно
  const [likesAggregation, dislikesAggregation] = await Promise.all([
    this.LikePostModel.aggregate([
      {
        $match: {
          postId: { $in: postIds },
          status: "Like"
        }
      },
      { $sort: { addedAt: -1 } },
      {
        $group: {
          _id: "$postId",
          likesCount: { $sum: 1 },
          newestLikes: {
            $push: {
              addedAt: "$addedAt",
              userId: "$userId",
              login: "$login"
            }
          }
        }
      },
      {
        $project: {
          likesCount: 1,
          newestLikes: { $slice: ["$newestLikes", 3] }
        }
      }
    ]),
    this.LikePostModel.aggregate([
      {
        $match: {
          postId: { $in: postIds },
          status: "Dislike"
        }
      },
      {
        $group: {
          _id: "$postId",
          dislikesCount: { $sum: 1 }
        }
      }
    ])
  ]);

  // Создаем мапы для быстрого доступа
  const likesMap = new Map(
    likesAggregation.map(item => [
      item._id,
      {
        likesCount: item.likesCount,
        newestLikes: item.newestLikes.map(like => ({
          addedAt: like.addedAt,
          userId: like.userId,
          login: like.login
        }))
      }
    ])
  );

  const dislikesMap = new Map(
    dislikesAggregation.map(item => [
      item._id,
      item.dislikesCount
    ])
  );

  // Формируем элементы для ответа
  const items = posts.map(post => {
    const postId = post._id.toString();

     return {
      ...PostViewDto.mapToView(post),
      extendedLikesInfo: {
        likesCount: likesMap.get(postId)?.likesCount || 0,
        dislikesCount: dislikesMap.get(postId) || 0,
        myStatus: userStatusMap.get(postId) || "None",
        newestLikes: likesMap.get(postId)?.newestLikes || []
      }
    };
  });
  return PaginatedViewDto.mapToView({
    page: query.pageNumber,
    size: query.pageSize,
    totalCount,
    items
  })
}
}
