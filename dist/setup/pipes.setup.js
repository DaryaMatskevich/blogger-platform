"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorFormatter = void 0;
exports.pipesSetup = pipesSetup;
const common_1 = require("@nestjs/common");
const domain_exeption_codes_1 = require("../core/exeptions/domain-exeption-codes");
const domain_exeptions_1 = require("../core/exeptions/domain-exeptions");
const errorFormatter = (errors, errorMessage) => {
    const errorsForResponse = errorMessage || [];
    for (const error of errors) {
        if (!error.constraints && error.children?.length) {
            (0, exports.errorFormatter)(error.children, errorsForResponse);
        }
        else if (error.constraints) {
            const constrainKeys = Object.keys(error.constraints);
            for (const key of constrainKeys) {
                errorsForResponse.push({
                    message: error.constraints[key]
                        ? `${error.constraints[key]}; Received value: ${error?.value}`
                        : '',
                    key: error.property,
                });
            }
        }
    }
    return errorsForResponse;
};
exports.errorFormatter = errorFormatter;
function pipesSetup(app) {
    app.useGlobalPipes(new common_1.ValidationPipe({
        transform: true,
        whitelist: true,
        validateCustomDecorators: true,
        stopAtFirstError: true,
        exceptionFactory: (errors) => {
            const formattedErrors = (0, exports.errorFormatter)(errors);
            throw new domain_exeptions_1.DomainException({
                code: domain_exeption_codes_1.DomainExceptionCode.ValidationError,
                message: 'Validation failed',
                extensions: formattedErrors,
            });
        },
    }));
}
//# sourceMappingURL=pipes.setup.js.map