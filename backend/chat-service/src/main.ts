// NestJS bootstrap file for chat-service
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT || 4002);
}

bootstrap().catch((err) => {
  // error log
  // eslint-disable-next-line no-console
  console.error('Error starting chat-service', err);
});

