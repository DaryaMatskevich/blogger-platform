"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetUsersQueryParams = void 0;
const openapi = require("@nestjs/swagger");
const base_query_params_input_dto_1 = require("../../../../core/dto/base.query.params.input.dto");
const users_sort_by_1 = require("./users-sort-by");
class GetUsersQueryParams extends base_query_params_input_dto_1.BaseQueryParams {
    sortBy = users_sort_by_1.UsersSortBy.CreatedAt;
    searchLoginTerm = null;
    searchEmailTerm = null;
    static _OPENAPI_METADATA_FACTORY() {
        return { sortBy: { required: true, type: () => Object, default: users_sort_by_1.UsersSortBy.CreatedAt, enum: require("./users-sort-by").UsersSortBy }, searchLoginTerm: { required: true, type: () => String, nullable: true, default: null }, searchEmailTerm: { required: true, type: () => String, nullable: true, default: null } };
    }
}
exports.GetUsersQueryParams = GetUsersQueryParams;
//# sourceMappingURL=get-users-query-params.input-dto.js.map