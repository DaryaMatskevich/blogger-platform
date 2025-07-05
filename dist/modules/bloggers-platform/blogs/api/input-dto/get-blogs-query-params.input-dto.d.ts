import { BaseQueryParams } from '../../../../../core/dto/base.query.params.input.dto';
import { BlogsSortBy } from './blogs-sort-by';
export declare class GetBlogsQueryParams extends BaseQueryParams {
    sortBy: BlogsSortBy;
    searchNameTerm: string | null;
}
