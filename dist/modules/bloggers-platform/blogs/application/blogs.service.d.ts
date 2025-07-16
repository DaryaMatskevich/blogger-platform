import { BlogModelType } from '../domain/dto/blog.entity';
import { BlogsRepository } from '../infastructure/blogs.repository';
import { CreateBlogDto } from '../dto/create-blog.dto';
import { UpdateBlogDto } from '../dto/update-blog.dto';
import { GetPostsQueryParams } from '../../posts/api/input-dto/get-posts-query-params.input-dto';
import { PostsQueryRepository } from '../../posts/infactructure/query/posts.query-repository';
export declare class BlogsService {
    private BlogModel;
    private blogsRepository;
    private postsQueryRepository;
    constructor(BlogModel: BlogModelType, blogsRepository: BlogsRepository, postsQueryRepository: PostsQueryRepository);
    createBlog(dto: CreateBlogDto): Promise<string>;
    updateBlog(id: string, dto: UpdateBlogDto): Promise<string>;
    deleteBlog(id: string): Promise<void>;
    getAllPostsForBlog(id: string, query: GetPostsQueryParams): Promise<import("../../../../core/dto/base.paginated.view.dto").PaginatedViewDto<import("../../posts/api/view-dto/posts.view-dto").PostViewDto[]>>;
    blogExists(id: string): Promise<{
        _id: import("mongoose").Types.ObjectId;
    } | null>;
}
