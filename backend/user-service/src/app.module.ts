// root module for user-service
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/user.entity';
import { UserModule } from './users/user.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    // configuration module setup
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // GraphQL configuration for user-service
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      path: '/graphql',
      context: ({ req }: { req: any }) => ({ req }),
    }),
    // TypeORM configuration for Postgres
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        url: process.env.USER_DB_URL,
        entities: [User],
        synchronize: false,
      }),
    }),
    UserModule,
    AuthModule,
  ],
})
export class AppModule {}

