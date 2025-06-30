import { BaseQueryParams } from 'src/core/dto/base.query.params.input.dto';
import { UsersSortBy } from './users-sort-by';
export declare class GetUsersQueryParams extends BaseQueryParams {
    sortBy: UsersSortBy;
    searchLoginTerm: string | null;
    searchEmailTerm: string | null;
}
