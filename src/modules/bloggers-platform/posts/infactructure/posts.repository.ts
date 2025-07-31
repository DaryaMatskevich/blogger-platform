import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument, PostModelType } from '../domain/post.entity';
import { DomainExceptionCode } from '../../../../core/exeptions/domain-exeption-codes';
import { DomainException } from '../../../../core/exeptions/domain-exeptions';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PostsRepository {
  //инжектирование модели через DI
  constructor(@InjectModel(Post.name) private PostModel: PostModelType) {}

  async findById(id: string): Promise<PostDocument | null> {
    return this.PostModel.findOne({
      _id: id,
      deletedAt: null,
    });
  }

  async save(post: PostDocument) {
    await post.save();
  }

  async findOrNotFoundFail(id: string): Promise<PostDocument> {
    const post = await this.PostModel.findOne({
      _id: id,
      deletedAt: null,
  });

    if (!post) {
      throw new DomainException({
              code: DomainExceptionCode.NotFound,
              message: "Post not found",
            })
    }

    return post;
  }
 }
