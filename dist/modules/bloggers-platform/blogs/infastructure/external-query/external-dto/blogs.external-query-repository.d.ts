import { BlogExternalDto } from './blogs.external-dto';
import { BlogModelType } from '../../../domain/dto/blog.entity';
export declare class BlogsExternalQueryRepository {
    private BlogModel;
    constructor(BlogModel: BlogModelType);
    getByIdOrNotFoundFail(id: string): Promise<BlogExternalDto>;
}
