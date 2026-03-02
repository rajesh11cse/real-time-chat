// service for message creation and querying with ordering guarantees
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './message.entity';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  async createMessage(roomId: string, senderId: string, content: string): Promise<Message> {
    const message = this.messageRepository.create({
      roomId,
      senderId,
      content,
    });
    return this.messageRepository.save(message);
  }

  async getMessagesByRoom(
    roomId: string,
    afterCursor?: { createdAt: Date; id: string },
    limit = 50,
  ): Promise<Message[]> {
    const qb = this.messageRepository
      .createQueryBuilder('m')
      .where('m.roomId = :roomId', { roomId })
      .orderBy('m.createdAt', 'ASC')
      .addOrderBy('m.id', 'ASC')
      .limit(limit);

    if (afterCursor) {
      qb.andWhere(
        '(m.createdAt, m.id) > (:createdAt, :id)',
        {
          createdAt: afterCursor.createdAt,
          id: afterCursor.id,
        },
      );
    }

    return qb.getMany();
  }
}

