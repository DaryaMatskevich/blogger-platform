import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export const titleConstraints = {
  minLength: 3,
  maxLength: 30,
};

export const shortDescriptionConstraints = {
  minLength: 3,
  maxLength: 100,
};

export const contentConstraints = {
  minLength: 3,
  maxLength: 1000,
};

export interface ExtendedLikesInfo {
  likesCount: number;
  dislikesCount: number;
  myStatus: string;
  newestLikes: Array<{
    addedAt: Date;
    userId: string;
    login: string;
  }>;
}

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  title: string;

  @Column({
    name: 'shortDescription',
    type: 'varchar',
    nullable: false,
  })
  shortDescription: string;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  content: string;

  @Column({
    name: 'blogId',
    type: 'integer',
    nullable: false,
  })
  blogId: number;

  @Column({
    name: 'blogName',
    type: 'varchar',
    nullable: false,
  })
  blogName: string;

  @CreateDateColumn({
    name: 'createdAt',
    type: 'timestamp',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updatedAt',
    type: 'timestamp',
  })
  updatedAt: Date;

  @Column({
    name: 'deletedAt',
    type: 'timestamp',
    nullable: true,
    default: null,
  })
  deletedAt: Date | null;

  @Column({
    name: 'extendedLikesInfo',
    type: 'jsonb',
    default: {
      likesCount: 0,
      dislikesCount: 0,
      myStatus: 'None',
      newestLikes: [],
    },
  })
  extendedLikesInfo: ExtendedLikesInfo;
}

// makeDeleted() {
//   if (this.deletedAt !== null) {
//     throw new Error('Entity already deleted');
//   }
//   this.deletedAt = new Date();
// }
//
// update(dto: UpdatePostDto) {
//   if (dto.title !== this.title) {
//     this.title = dto.title;
//   }
//   if (dto.shortDescription !== this.shortDescription) {
//     this.shortDescription = dto.shortDescription;
//   }
//   if (dto.content !== this.content) {
//     this.content = dto.content;
//   }
// }
//
// changeLikesCounter(
//   oldStatus: string,
//   newStatus: string,
//   userId: string,
//   userLogin: string,
// ) {
//   // 1. Обновляем счетчики
//   if (oldStatus === 'Like') {
//     this.extendedLikesInfo.likesCount--;
//   } else if (oldStatus === 'Dislike') {
//     this.extendedLikesInfo.dislikesCount--;
//   }
//
//   if (newStatus === 'Like') {
//     this.extendedLikesInfo.likesCount++;
//   } else if (newStatus === 'Dislike') {
//     this.extendedLikesInfo.dislikesCount++;
//   }
//
//   // Гарантируем неотрицательные значения
//   this.extendedLikesInfo.likesCount = Math.max(
//     this.extendedLikesInfo.likesCount,
//     0,
//   );
//   this.extendedLikesInfo.dislikesCount = Math.max(
//     this.extendedLikesInfo.dislikesCount,
//     0,
//   );
//
//   // 2. Обновляем список новейших лайков
//   // Удаляем старую запись пользователя
//   this.extendedLikesInfo.newestLikes =
//     this.extendedLikesInfo.newestLikes.filter(
//       (like) => like.userId !== userId,
//     );
//
//   // Добавляем новую запись если это лайк
//   if (newStatus === 'Like') {
//     this.extendedLikesInfo.newestLikes.push({
//       addedAt: new Date(),
//       userId,
//       login: userLogin,
//     });
//
//     // Сортируем по дате (новые впереди) и оставляем 3 последних
//     this.extendedLikesInfo.newestLikes.sort(
//       (a, b) => b.addedAt.getTime() - a.addedAt.getTime(),
//     );
//
//     // Оставляем только 3 последних лайка
//     this.extendedLikesInfo.newestLikes =
//       this.extendedLikesInfo.newestLikes.slice(0, 3);
//   }
// }
