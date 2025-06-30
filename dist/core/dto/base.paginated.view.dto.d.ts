export declare abstract class PaginatedViewDto<T> {
    pagesCount: number;
    page: number;
    pageSize: number;
    totalCount: number;
    abstract items: T;
    static mapToView<T>(data: {
        page: number;
        size: number;
        totalCount: number;
        items: T;
    }): PaginatedViewDto<T>;
}
