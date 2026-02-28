// AI-generated Redis PubSub module for GraphQL subscriptions
import { Global, Module } from '@nestjs/common';
import { RedisPubSub } from 'graphql-redis-subscriptions';
// AI-generated: ioredis default export is the Redis client constructor
import Redis, { RedisOptions } from 'ioredis';

export const PUB_SUB = 'PUB_SUB';

@Global()
@Module({
  providers: [
    {
      provide: PUB_SUB,
      useFactory: () => {
        const options: RedisOptions = {
          host: process.env.REDIS_HOST || 'redis',
          port: Number(process.env.REDIS_PORT) || 6379,
        };
        const publisher = new Redis(options);
        const subscriber = new Redis(options);
        return new RedisPubSub({ publisher, subscriber });
      },
    },
  ],
  exports: [PUB_SUB],
})
export class PubSubModule {}

