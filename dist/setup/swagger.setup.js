"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerSetup = swaggerSetup;
const swagger_1 = require("@nestjs/swagger");
function swaggerSetup(app) {
    const config = new swagger_1.DocumentBuilder()
        .setTitle('BLOGGER API')
        .addBearerAuth()
        .setVersion('1.0')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/swagger', app, document, {
        customSiteTitle: 'Blogger Swagger',
    });
}
//# sourceMappingURL=swagger.setup.js.map