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
exports.MessageService = void 0;
// service for message creation and querying with ordering guarantees
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const message_entity_1 = require("./message.entity");
let MessageService = class MessageService {
    constructor(messageRepository) {
        this.messageRepository = messageRepository;
    }
    async createMessage(roomId, senderId, content) {
        const message = this.messageRepository.create({
            roomId,
            senderId,
            content,
        });
        return this.messageRepository.save(message);
    }
    async getMessagesByRoom(roomId, afterCursor, limit = 50) {
        const qb = this.messageRepository
            .createQueryBuilder('m')
            .where('m.roomId = :roomId', { roomId })
            .orderBy('m.createdAt', 'ASC')
            .addOrderBy('m.id', 'ASC')
            .limit(limit);
        if (afterCursor) {
            qb.andWhere('(m.createdAt, m.id) > (:createdAt, :id)', {
                createdAt: afterCursor.createdAt,
                id: afterCursor.id,
            });
        }
        return qb.getMany();
    }
};
exports.MessageService = MessageService;
exports.MessageService = MessageService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(message_entity_1.Message)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], MessageService);
