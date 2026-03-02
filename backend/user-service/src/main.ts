// NestJS bootstrap file for user-service
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT || 4001);
}

bootstrap().catch((err) => {
  // In production you might want better structured logging here
  // error log
  // eslint-disable-next-line no-console
  console.error('Error starting user-service', err);
});

