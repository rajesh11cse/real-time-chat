"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
// AI-generated root module for chat-service
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const graphql_1 = require("@nestjs/graphql");
const apollo_1 = require("@nestjs/apollo");
const typeorm_1 = require("@nestjs/typeorm");
const room_entity_1 = require("./rooms/room.entity");
const room_member_entity_1 = require("./rooms/room-member.entity");
const message_entity_1 = require("./messages/message.entity");
const room_module_1 = require("./rooms/room.module");
const message_module_1 = require("./messages/message.module");
const pubsub_module_1 = require("./subscriptions/pubsub.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            // AI-generated configuration module setup
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            // AI-generated GraphQL configuration with subscriptions for chat-service
            graphql_1.GraphQLModule.forRoot({
                driver: apollo_1.ApolloDriver,
                autoSchemaFile: true,
                path: '/graphql',
                installSubscriptionHandlers: true,
                subscriptions: {
                    'graphql-ws': true,
                    'subscriptions-transport-ws': true,
                },
                context: ({ req, extra }) => {
                    // For WebSocket connections, build a fake request object
                    if (req) {
                        return { req };
                    }
                    const connectionParams = extra?.connectionParams ?? {};
                    const authHeader = connectionParams.authorization || connectionParams.Authorization;
                    return {
                        req: {
                            headers: {
                                authorization: authHeader,
                            },
                        },
                    };
                },
            }),
            // AI-generated TypeORM configuration for Postgres
            typeorm_1.TypeOrmModule.forRootAsync({
                useFactory: () => ({
                    type: 'postgres',
                    url: process.env.CHAT_DB_URL,
                    entities: [room_entity_1.Room, room_member_entity_1.RoomMember, message_entity_1.Message],
                    synchronize: false,
                }),
            }),
            pubsub_module_1.PubSubModule,
            room_module_1.RoomModule,
            message_module_1.MessageModule,
        ],
    })
], AppModule);
