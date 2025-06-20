export abstract class PaginatedViewDto<T> {
  pagesCount: number;
  page: number;
   pageSize: number;
   totalCount: number;
  abstract items: T;
  

  //статический метод-утилита для мапинга
  public static mapToView<T>(data: {
    page: number;
    size: number;
    totalCount: number;
    items: T;
  }): PaginatedViewDto<T> {
    return {
      pagesCount: Math.ceil(data.totalCount / data.size),
      page: data.page,
      pageSize: data.size,
      totalCount: data.totalCount,
      items: data.items,
    };
  }
}