import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view.dto';
import { BlogModelType } from '../../domain/dto/blog.entity';
import { BlogViewDto } from '../../api/view-dto/blogs.view-dto';
import { GetBlogsQueryParams } from '../../api/input-dto/get-blogs-query-params.input-dto';
export declare class BlogsQueryRepository {
    private BlogModel;
    constructor(BlogModel: BlogModelType);
    getByIdOrNotFoundFail(id: string): Promise<BlogViewDto>;
    getAll(query: GetBlogsQueryParams): Promise<PaginatedViewDto<BlogViewDto[]>>;
}
