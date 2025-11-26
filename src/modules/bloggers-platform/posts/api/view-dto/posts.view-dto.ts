type LikeInfo = {
  addedAt: Date;
  userId: string;
  login: string;
};

type ExtendedLikesInfo = {
  likesCount: number;
  dislikesCount: number;
  myStatus: string;
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

  static mapToView(post: any): PostViewDto {
    const dto = new PostViewDto();

    dto.id = post.id.toString();
    dto.title = post.title;
    dto.shortDescription = post.shortDescription;
    dto.content = post.content;
    dto.blogId = post.blogId.toString();
    dto.blogName = post.blogName;
    dto.createdAt = post.createdAt;

    // Берем готовые данные из extendedLikesInfo
    dto.extendedLikesInfo = {
      likesCount: 0,
      dislikesCount: 0,
      myStatus: 'None',
      newestLikes: [],
    };

    return dto;
  }
}
