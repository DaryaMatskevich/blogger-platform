"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const app_setup_1 = require("./setup/app.setup");
const fs_1 = require("fs");
const http_1 = require("http");
const port = process.env.PORT || 5005;
const serverUrl = 'http://localhost:5005';
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors();
    (0, app_setup_1.appSetup)(app);
    await app.listen(port, () => {
        console.log('Server is running on port ' + port);
    });
    if (process.env.NODE_ENV === 'development') {
        (0, http_1.get)(`${serverUrl}/swagger/swagger-ui-bundle.js`, function (response) {
            response.pipe((0, fs_1.createWriteStream)('swagger-static/swagger-ui-bundle.js'));
            console.log(`Swagger UI bundle file written to: '/swagger-static/swagger-ui-bundle.js'`);
        });
        (0, http_1.get)(`${serverUrl}/swagger/swagger-ui-init.js`, function (response) {
            response.pipe((0, fs_1.createWriteStream)('swagger-static/swagger-ui-init.js'));
            console.log(`Swagger UI init file written to: '/swagger-static/swagger-ui-init.js'`);
        });
        (0, http_1.get)(`${serverUrl}/swagger/swagger-ui-standalone-preset.js`, function (response) {
            response.pipe((0, fs_1.createWriteStream)('swagger-static/swagger-ui-standalone-preset.js'));
            console.log(`Swagger UI standalone preset file written to: '/swagger-static/swagger-ui-standalone-preset.js'`);
        });
        (0, http_1.get)(`${serverUrl}/swagger/swagger-ui.css`, function (response) {
            response.pipe((0, fs_1.createWriteStream)('swagger-static/swagger-ui.css'));
            console.log(`Swagger UI css file written to: '/swagger-static/swagger-ui.css'`);
        });
    }
}
bootstrap();
//# sourceMappingURL=main.js.map