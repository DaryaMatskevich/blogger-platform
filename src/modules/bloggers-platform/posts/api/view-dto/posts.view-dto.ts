export type LikeInfo = {
  addedAt: Date;
  userId: string;
  login: string;
};

export type ExtendedLikesInfo = {
  likesCount: number;
  dislikesCount: number;
  myStatus: string; // 'Like' | 'Dislike' | 'None'
  newestLikes: LikeInfo[];
};

export class PostViewDto {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: Date;
  extendedLikesInfo: ExtendedLikesInfo;

  static mapToView(data: {
    id: number;
    title: string;
    shortDescription: string;
    content: string;
    blogId: number;
    blogName: string;
    createdAt: Date;
    extendedLikesInfo: {
      likesCount: number;
      dislikesCount: number;
      myStatus: string;
      newestLikes: Array<{
        addedAt: Date;
        userId: string;
        login: string;
      }>;
    };
  }): PostViewDto {
    const dto = new PostViewDto();

    dto.id = data.id.toString();
    dto.title = data.title;
    dto.shortDescription = data.shortDescription;
    dto.content = data.content;
    dto.blogId = data.blogId.toString();
    dto.blogName = data.blogName;
    dto.createdAt = data.createdAt;

    // Для неавторизованного пользователя всегда 'None'
    dto.extendedLikesInfo = {
      likesCount: data.extendedLikesInfo.likesCount,
      dislikesCount: data.extendedLikesInfo.dislikesCount,
      myStatus: 'None',
      newestLikes: data.extendedLikesInfo.newestLikes.map((like) => ({
        addedAt: like.addedAt,
        userId: like.userId,
        login: like.login,
      })),
    };

    return dto;
  }
}
