import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { CreateBlogInputDto } from '../../api/input-dto/blogs.input-dto';
import { UpdateBlogDto } from '../../dto/update-blog.dto';


//флаг timestemp автоматичеки добавляет поля upatedAt и createdAt
/**
 * User Entity Schema
 * This class represents the schema and behavior of a User entity.
 */
@Schema({ timestamps: true })
export class Blog {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({ type: String, min: 5, required: true })
  websiteUrl: string;

  @Prop({ type: Boolean, default: false })
  isMembership: Boolean;

   createdAt: Date;

  updatedAt: Date;
  
  @Prop({ type: Date, nullable: true,   default: null })
  deletedAt: Date | null;

    static createInstance(dto: CreateBlogInputDto): BlogDocument {
    const blog = new this();
    blog.name = dto.name;
    blog.description = dto.description;
    blog.websiteUrl = dto.websiteUrl;
    
    return blog as BlogDocument;
  }

  makeDeleted() {
    if (this.deletedAt !== null) {
      throw new Error('Entity already deleted');
    }
    this.deletedAt = new Date();
  }


  update(dto: UpdateBlogDto) {
    if (dto.name !== this.name) {
      this.name = dto.name;
    }
    if (dto.description !== this.description) {
      this.description = dto.description;
    }
    if (dto.websiteUrl !== this.websiteUrl) {
      this.websiteUrl = dto.websiteUrl;
    }
  }
}

export const BlogSchema = SchemaFactory.createForClass(Blog);

//регистрирует методы сущности в схеме
BlogSchema.loadClass(Blog);

//Типизация документа
export type BlogDocument = HydratedDocument<Blog>;

//Типизация модели + статические методы
export type BlogModelType = Model<BlogDocument> & typeof Blog;