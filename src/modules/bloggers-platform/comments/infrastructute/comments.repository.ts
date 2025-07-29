import { InjectModel } from '@nestjs/mongoose';

import { Injectable, NotFoundException } from '@nestjs/common';
import { Comment, CommentDocument, CommentModelType } from '../domain/comment.entity';


@Injectable()
export class CommentsRepository {
  //инжектирование модели через DI
  constructor(@InjectModel(Comment.name) private CommentModel: CommentModelType) {}


  async save(comment: CommentDocument) {
    await comment.save();
  }


   async findOrNotFoundFail(id: string): Promise<CommentDocument> {
      const comment = await this.CommentModel.findById(id);
  
      if (!comment) {
        //TODO: replace with domain exception
        throw new NotFoundException('user not found');
      }
  
      return comment;
    }
}
