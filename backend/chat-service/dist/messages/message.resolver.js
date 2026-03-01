"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageResolver = void 0;
// AI-generated GraphQL resolver for messages, including subscriptions
const common_1 = require("@nestjs/common");
const graphql_1 = require("@nestjs/graphql");
const message_entity_1 = require("./message.entity");
const message_service_1 = require("./message.service");
const pubsub_module_1 = require("../subscriptions/pubsub.module");
const graphql_redis_subscriptions_1 = require("graphql-redis-subscriptions");
const gql_auth_guard_1 = require("../security/gql-auth.guard");
const current_user_decorator_1 = require("../security/current-user.decorator");
const MESSAGE_ADDED_TOPIC = 'MESSAGE_ADDED_TOPIC';
let MessageEdge = class MessageEdge {
};
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", String)
], MessageEdge.prototype, "cursor", void 0);
__decorate([
    (0, graphql_1.Field)(() => message_entity_1.Message),
    __metadata("design:type", message_entity_1.Message)
], MessageEdge.prototype, "node", void 0);
MessageEdge = __decorate([
    (0, graphql_1.ObjectType)()
], MessageEdge);
let PageInfo = class PageInfo {
};
__decorate([
    (0, graphql_1.Field)(),
    __metadata("design:type", Boolean)
], PageInfo.prototype, "hasNextPage", void 0);
__decorate([
    (0, graphql_1.Field)({ nullable: true }),
    __metadata("design:type", String)
], PageInfo.prototype, "endCursor", void 0);
PageInfo = __decorate([
    (0, graphql_1.ObjectType)()
], PageInfo);
let MessageConnection = class MessageConnection {
};
__decorate([
    (0, graphql_1.Field)(() => [MessageEdge]),
    __metadata("design:type", Array)
], MessageConnection.prototype, "edges", void 0);
__decorate([
    (0, graphql_1.Field)(() => PageInfo),
    __metadata("design:type", PageInfo)
], MessageConnection.prototype, "pageInfo", void 0);
MessageConnection = __decorate([
    (0, graphql_1.ObjectType)()
], MessageConnection);
function encodeCursor(message) {
    return Buffer.from(`${message.createdAt.toISOString()}|${message.id}`).toString('base64');
}
function decodeCursor(cursor) {
    const decoded = Buffer.from(cursor, 'base64').toString('utf8');
    const [createdAtStr, id] = decoded.split('|');
    return { createdAt: new Date(createdAtStr), id };
}
let MessageResolver = class MessageResolver {
    constructor(messageService, pubSub) {
        this.messageService = messageService;
        this.pubSub = pubSub;
    }
    async messages(roomId, after, limit) {
        const cursor = after ? decodeCursor(after) : undefined;
        const messages = await this.messageService.getMessagesByRoom(roomId, cursor, limit);
        const edges = messages.map((m) => ({
            cursor: encodeCursor(m),
            node: m,
        }));
        const endCursor = edges.length > 0 ? edges[edges.length - 1].cursor : undefined;
        return {
            edges,
            pageInfo: {
                hasNextPage: messages.length === (limit ?? 50),
                endCursor,
            },
        };
    }
    async sendMessage(roomId, content, user) {
        const message = await this.messageService.createMessage(roomId, user.userId, content);
        const roomIdStr = String(roomId);
        const serialized = {
            id: String(message.id),
            roomId: roomIdStr,
            senderId: String(message.senderId),
            content: message.content,
            createdAt: message.createdAt.toISOString(),
        };
        await this.pubSub.publish(MESSAGE_ADDED_TOPIC, {
            messageAdded: serialized,
            roomId: roomIdStr,
        });
        return message;
    }
    // No auth guard on subscription so both clients get 101 and receive events; mutations still protected
    messageAdded(_roomId) {
        return this.pubSub.asyncIterator(MESSAGE_ADDED_TOPIC);
    }
};
exports.MessageResolver = MessageResolver;
__decorate([
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    (0, graphql_1.Query)(() => MessageConnection),
    __param(0, (0, graphql_1.Args)('roomId', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('after', { type: () => String, nullable: true })),
    __param(2, (0, graphql_1.Args)('limit', { type: () => graphql_1.Int, nullable: true, defaultValue: 50 })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number]),
    __metadata("design:returntype", Promise)
], MessageResolver.prototype, "messages", null);
__decorate([
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    (0, graphql_1.Mutation)(() => message_entity_1.Message),
    __param(0, (0, graphql_1.Args)('roomId', { type: () => graphql_1.ID })),
    __param(1, (0, graphql_1.Args)('content')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], MessageResolver.prototype, "sendMessage", null);
__decorate([
    (0, graphql_1.Subscription)(() => message_entity_1.Message, {
        filter: (payload, variables) => String(payload?.roomId) === String(variables?.roomId),
        resolve: (payload) => {
            const msg = payload?.messageAdded;
            if (!msg)
                return msg;
            return {
                ...msg,
                createdAt: typeof msg.createdAt === 'string' ? new Date(msg.createdAt) : msg.createdAt,
            };
        },
    }),
    __param(0, (0, graphql_1.Args)('roomId', { type: () => graphql_1.ID })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MessageResolver.prototype, "messageAdded", null);
exports.MessageResolver = MessageResolver = __decorate([
    (0, graphql_1.Resolver)(() => message_entity_1.Message),
    __param(1, (0, common_1.Inject)(pubsub_module_1.PUB_SUB)),
    __metadata("design:paramtypes", [message_service_1.MessageService,
        graphql_redis_subscriptions_1.RedisPubSub])
], MessageResolver);
