"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// NestJS bootstrap file for chat-service
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    await app.listen(process.env.PORT || 4002);
}
bootstrap().catch((err) => {
    // error log
    // eslint-disable-next-line no-console
    console.error('Error starting chat-service', err);
});
