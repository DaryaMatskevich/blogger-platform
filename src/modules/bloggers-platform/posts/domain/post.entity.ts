import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { ExtendedLikesInfo, ExtendedLikesInfoSchema } from './extendedLikesInfo.schema';
import { UpdatePostDto } from '../api/input-dto/posts.update-input.dto';
import { CreatePostDomainDto } from './create-post.domain.dto';


//флаг timestemp автоматичеки добавляет поля upatedAt и createdAt
/**
 * User Entity Schema
 * This class represents the schema and behavior of a User entity.
 */
@Schema({ timestamps: true })
export class Post {
  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  shortDescription: string;

  @Prop({ type: String, min: 5, required: true })
  content: string;

   @Prop({ type: String, required: true })
  blogId: string;

   @Prop({ type: String, required: true })
  blogName: string;

   createdAt: Date;

  updatedAt: Date;
  
  @Prop({ type: Date, nullable: true,   default: null })
  deletedAt: Date | null;

  @Prop({ 
    required: true, 
    type: ExtendedLikesInfoSchema, 
    default: () => ({
      likesCount: 0,
      dislikesCount: 0,
      myStatus: 'None',
      newestLikes: []
    })
  })
  extendedLikesInfo: ExtendedLikesInfo;


    static createInstance(dto: CreatePostDomainDto): PostDocument {
    const post = new this();
    post.title = dto.title;
    post.shortDescription = dto.shortDescription;
    post.content = dto.content;
    post.blogId = dto.blogId;
    post.blogName = dto.blogName;
   
    return post as PostDocument;
  }

  makeDeleted() {
    if (this.deletedAt !== null) {
      throw new Error('Entity already deleted');
    }
    this.deletedAt = new Date();
  }


  update(dto: UpdatePostDto) {
    if (dto.title !== this.title) {
      this.title = dto.title;
    }
    if (dto.shortDescription !== this.shortDescription) {
      this.shortDescription = dto.shortDescription;
    }
    if (dto.content !== this.content) {
      this.content = dto.content;
     }
}
}
export const PostSchema = SchemaFactory.createForClass(Post);

//регистрирует методы сущности в схеме
PostSchema.loadClass(Post);

//Типизация документа
export type PostDocument = HydratedDocument<Post>;

//Типизация модели + статические методы
export type PostModelType = Model<PostDocument> & typeof Post;