"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// NestJS bootstrap file for user-service
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    await app.listen(process.env.PORT || 4001);
}
bootstrap().catch((err) => {
    // In production you might want better structured logging here
    // error log
    // eslint-disable-next-line no-console
    console.error('Error starting user-service', err);
});
