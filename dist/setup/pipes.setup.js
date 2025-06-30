"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pipesSetup = pipesSetup;
const common_1 = require("@nestjs/common");
function pipesSetup(app) {
    app.useGlobalPipes(new common_1.ValidationPipe({
        transform: true,
    }));
}
//# sourceMappingURL=pipes.setup.js.map