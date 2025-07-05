import { BlogViewDto } from './view-dto/blogs.view-dto';
import { CreateBlogInputDto } from './input-dto/blogs.input-dto';
import { UpdateBlogInputDto } from './input-dto/update-blog.input-dto';
import { GetBlogsQueryParams } from './input-dto/get-blogs-query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view.dto';
import { BlogsService } from '../application/blogs.service';
import { BlogsQueryRepository } from '../infastructure/query/blogs.query-repository';
export declare class BlogsController {
    private blogsQueryRepository;
    private blogsService;
    constructor(blogsQueryRepository: BlogsQueryRepository, blogsService: BlogsService);
    getById(id: string): Promise<BlogViewDto>;
    getAll(query: GetBlogsQueryParams): Promise<PaginatedViewDto<BlogViewDto[]>>;
    createBlog(body: CreateBlogInputDto): Promise<BlogViewDto>;
    updateBlog(id: string, body: UpdateBlogInputDto): Promise<BlogViewDto>;
    deleteBlog(id: string): Promise<void>;
}
