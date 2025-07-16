"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appSetup = appSetup;
const pipes_setup_1 = require("./pipes.setup");
const swagger_setup_1 = require("./swagger.setup");
const exception_filter_1 = require("../exception.filter");
function appSetup(app) {
    (0, pipes_setup_1.pipesSetup)(app);
    (0, swagger_setup_1.swaggerSetup)(app);
    app.useGlobalFilters(new exception_filter_1.HttpExceptionFilter());
}
//# sourceMappingURL=app.setup.js.map