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
exports.SortDirection = exports.BaseQueryParams = void 0;
const class_transformer_1 = require("class-transformer");
class BaseQueryParams {
    pageNumber = 1;
    pageSize = 10;
    sortDirection = SortDirection.Desc;
    calculateSkip() {
        return (this.pageNumber - 1) * this.pageSize;
    }
}
exports.BaseQueryParams = BaseQueryParams;
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], BaseQueryParams.prototype, "pageNumber", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], BaseQueryParams.prototype, "pageSize", void 0);
var SortDirection;
(function (SortDirection) {
    SortDirection["Asc"] = "asc";
    SortDirection["Desc"] = "desc";
})(SortDirection || (exports.SortDirection = SortDirection = {}));
//# sourceMappingURL=base.query.params.input.dto.js.map