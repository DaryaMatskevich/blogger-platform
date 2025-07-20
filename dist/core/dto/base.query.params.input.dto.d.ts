export declare enum SortDirection {
    Asc = "asc",
    Desc = "desc"
}
export declare class BaseQueryParams {
    pageNumber: number;
    pageSize: number;
    sortDirection: SortDirection;
    calculateSkip(): number;
}
