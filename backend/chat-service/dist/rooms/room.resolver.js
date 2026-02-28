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
exports.RoomResolver = void 0;
// AI-generated GraphQL resolver for chat rooms and membership
const common_1 = require("@nestjs/common");
const graphql_1 = require("@nestjs/graphql");
const room_entity_1 = require("./room.entity");
const room_service_1 = require("./room.service");
const gql_auth_guard_1 = require("../security/gql-auth.guard");
const current_user_decorator_1 = require("../security/current-user.decorator");
let RoomResolver = class RoomResolver {
    constructor(roomService) {
        this.roomService = roomService;
    }
    async chatRoom(id) {
        return this.roomService.findRoomById(id);
    }
    async chatRooms(limit, offset) {
        return this.roomService.listRooms(limit, offset);
    }
    async createRoom(name, user) {
        return this.roomService.createRoom(name, user.userId);
    }
    async joinRoom(roomId, user) {
        return this.roomService.joinRoom(roomId, user.userId);
    }
};
exports.RoomResolver = RoomResolver;
__decorate([
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    (0, graphql_1.Query)(() => room_entity_1.Room, { nullable: true }),
    __param(0, (0, graphql_1.Args)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RoomResolver.prototype, "chatRoom", null);
__decorate([
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    (0, graphql_1.Query)(() => [room_entity_1.Room]),
    __param(0, (0, graphql_1.Args)('limit', { type: () => graphql_1.Int, nullable: true, defaultValue: 20 })),
    __param(1, (0, graphql_1.Args)('offset', { type: () => graphql_1.Int, nullable: true, defaultValue: 0 })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], RoomResolver.prototype, "chatRooms", null);
__decorate([
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    (0, graphql_1.Mutation)(() => room_entity_1.Room),
    __param(0, (0, graphql_1.Args)('name')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RoomResolver.prototype, "createRoom", null);
__decorate([
    (0, common_1.UseGuards)(gql_auth_guard_1.GqlAuthGuard),
    (0, graphql_1.Mutation)(() => room_entity_1.Room),
    __param(0, (0, graphql_1.Args)('roomId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RoomResolver.prototype, "joinRoom", null);
exports.RoomResolver = RoomResolver = __decorate([
    (0, graphql_1.Resolver)(() => room_entity_1.Room),
    __metadata("design:paramtypes", [room_service_1.RoomService])
], RoomResolver);
