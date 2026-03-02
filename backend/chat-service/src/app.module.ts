// root module for chat-service
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Room } from './rooms/room.entity';
import { RoomMember } from './rooms/room-member.entity';
import { Message } from './messages/message.entity';
import { RoomModule } from './rooms/room.module';
import { MessageModule } from './messages/message.module';
import { PubSubModule } from './subscriptions/pubsub.module';

@Module({
  imports: [
    // configuration module setup
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // GraphQL configuration with subscriptions for chat-service
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      path: '/graphql',
      installSubscriptionHandlers: true,
      subscriptions: {
        'graphql-ws': true,
        'subscriptions-transport-ws': true,
      },
      context: ({ req, extra }: { req?: any; extra?: any }) => {
        // For WebSocket connections, build a fake request object
        if (req) {
          return { req };
        }
        const connectionParams: any = extra?.connectionParams ?? {};
        const authHeader =
          connectionParams.authorization || connectionParams.Authorization;
        return {
          req: {
            headers: {
              authorization: authHeader,
            },
          },
        };
      },
    }),
    // TypeORM configuration for Postgres
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        url: process.env.CHAT_DB_URL,
        entities: [Room, RoomMember, Message],
        synchronize: false,
      }),
    }),
    PubSubModule,
    RoomModule,
    MessageModule,
  ],
})
export class AppModule {}

