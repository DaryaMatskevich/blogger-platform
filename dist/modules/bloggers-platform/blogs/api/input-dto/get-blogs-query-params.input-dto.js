"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetBlogsQueryParams = void 0;
const openapi = require("@nestjs/swagger");
const base_query_params_input_dto_1 = require("../../../../../core/dto/base.query.params.input.dto");
const blogs_sort_by_1 = require("./blogs-sort-by");
class GetBlogsQueryParams extends base_query_params_input_dto_1.BaseQueryParams {
    sortBy = blogs_sort_by_1.BlogsSortBy.CreatedAt;
    searchNameTerm = null;
    static _OPENAPI_METADATA_FACTORY() {
        return { sortBy: { required: true, type: () => Object, default: blogs_sort_by_1.BlogsSortBy.CreatedAt, enum: require("./blogs-sort-by").BlogsSortBy }, searchNameTerm: { required: true, type: () => String, nullable: true, default: null } };
    }
}
exports.GetBlogsQueryParams = GetBlogsQueryParams;
//# sourceMappingURL=get-blogs-query-params.input-dto.js.map