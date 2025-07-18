"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appSetup = appSetup;
const pipes_setup_1 = require("./pipes.setup");
const global_prefix_setup_1 = require("./global-prefix.setup");
const swagger_setup_1 = require("./swagger.setup");
function appSetup(app) {
    (0, pipes_setup_1.pipesSetup)(app);
    (0, global_prefix_setup_1.globalPrefixSetup)(app);
    (0, swagger_setup_1.swaggerSetup)(app);
}
//# sourceMappingURL=app.setup.js.map