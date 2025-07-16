"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetUsersQueryParams = void 0;
const openapi = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
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
__decorate([
    (0, class_validator_1.IsEnum)(users_sort_by_1.UsersSortBy),
    __metadata("design:type", Object)
], GetUsersQueryParams.prototype, "sortBy", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], GetUsersQueryParams.prototype, "searchLoginTerm", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], GetUsersQueryParams.prototype, "searchEmailTerm", void 0);
//# sourceMappingURL=get-users-query-params.input-dto.js.map