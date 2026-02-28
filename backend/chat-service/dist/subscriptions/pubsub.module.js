"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PubSubModule = exports.PUB_SUB = void 0;
// AI-generated Redis PubSub module for GraphQL subscriptions
const common_1 = require("@nestjs/common");
const graphql_redis_subscriptions_1 = require("graphql-redis-subscriptions");
// AI-generated: ioredis default export is the Redis client constructor
const ioredis_1 = __importDefault(require("ioredis"));
exports.PUB_SUB = 'PUB_SUB';
let PubSubModule = class PubSubModule {
};
exports.PubSubModule = PubSubModule;
exports.PubSubModule = PubSubModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [
            {
                provide: exports.PUB_SUB,
                useFactory: () => {
                    const options = {
                        host: process.env.REDIS_HOST || 'redis',
                        port: Number(process.env.REDIS_PORT) || 6379,
                    };
                    const publisher = new ioredis_1.default(options);
                    const subscriber = new ioredis_1.default(options);
                    return new graphql_redis_subscriptions_1.RedisPubSub({ publisher, subscriber });
                },
            },
        ],
        exports: [exports.PUB_SUB],
    })
], PubSubModule);
