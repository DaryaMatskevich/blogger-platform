import { BlogDocument, BlogModelType } from '../domain/dto/blog.entity';
export declare class BlogsRepository {
    private BlogModel;
    constructor(BlogModel: BlogModelType);
    findById(id: string): Promise<BlogDocument | null>;
    save(blog: BlogDocument): Promise<void>;
    findOrNotFoundFail(id: string): Promise<BlogDocument>;
}
