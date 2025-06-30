"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaginatedViewDto = void 0;
class PaginatedViewDto {
    pagesCount;
    page;
    pageSize;
    totalCount;
    static mapToView(data) {
        return {
            pagesCount: Math.ceil(data.totalCount / data.size),
            page: data.page,
            pageSize: data.size,
            totalCount: data.totalCount,
            items: data.items,
        };
    }
}
exports.PaginatedViewDto = PaginatedViewDto;
//# sourceMappingURL=base.paginated.view.dto.js.map