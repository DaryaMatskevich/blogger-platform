import { Injectable } from '@nestjs/common';
import { Post, PostModelType } from '../domain/post.entity';
import { InjectModel } from '@nestjs/mongoose';


@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name)
        private PostModel: PostModelType,
  ) {}

  async postExists(id: string) {
   const exists = await this.PostModel.findOne({ _id: id, deletedAt: null }).lean();
return !!exists;
}
  }
  