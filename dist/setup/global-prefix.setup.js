"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GLOBAL_PREFIX = void 0;
exports.globalPrefixSetup = globalPrefixSetup;
exports.GLOBAL_PREFIX = 'api';
function globalPrefixSetup(app) {
    app.setGlobalPrefix(exports.GLOBAL_PREFIX);
}
//# sourceMappingURL=global-prefix.setup.js.map