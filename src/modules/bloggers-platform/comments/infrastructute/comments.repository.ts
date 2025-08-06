import { InjectModel } from '@nestjs/mongoose';

import { Injectable} from '@nestjs/common';
import { Comment, CommentDocument, CommentModelType } from '../domain/comment.entity';
import { DomainException } from '../../../../core/exeptions/domain-exeptions';
import { DomainExceptionCode } from '../../../../core/exeptions/domain-exeption-codes';


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
          throw new DomainException({
                code: DomainExceptionCode.NotFound,
                message: "Blog not found",
              })
      }
  
      return comment;
    }
}
