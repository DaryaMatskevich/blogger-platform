export declare class BaseQueryParams {
    pageNumber: number;
    pageSize: number;
    sortDirection: SortDirection;
    calculateSkip(): number;
}
export declare enum SortDirection {
    Asc = "asc",
    Desc = "desc"
}
