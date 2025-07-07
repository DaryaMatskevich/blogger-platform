import { HydratedDocument, Model } from 'mongoose';
import { CreateBlogInputDto } from '../../api/input-dto/blogs.input-dto';
import { UpdateBlogDto } from '../../dto/update-blog.dto';
export declare class Blog {
    name: string;
    description: string;
    websiteUrl: string;
    isMembership: Boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    static createInstance(dto: CreateBlogInputDto): BlogDocument;
    makeDeleted(): void;
    update(dto: UpdateBlogDto): void;
}
export declare const BlogSchema: import("mongoose").Schema<Blog, Model<Blog, any, any, any, import("mongoose").Document<unknown, any, Blog, any> & Blog & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Blog, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<Blog>, {}> & import("mongoose").FlatRecord<Blog> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
export type BlogDocument = HydratedDocument<Blog>;
export type BlogModelType = Model<BlogDocument> & typeof Blog;
