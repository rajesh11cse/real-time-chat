// AI-generated service for room and membership management
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './room.entity';
import { RoomMember } from './room-member.entity';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    @InjectRepository(RoomMember)
    private readonly memberRepository: Repository<RoomMember>,
  ) {}

  async createRoom(name: string, createdBy: string): Promise<Room> {
    const room = this.roomRepository.create({ name, createdBy });
    const saved = await this.roomRepository.save(room);
    const member = this.memberRepository.create({
      roomId: saved.id,
      userId: createdBy,
    });
    await this.memberRepository.save(member);
    return saved;
  }

  async joinRoom(roomId: string, userId: string): Promise<Room> {
    const room = await this.roomRepository.findOne({ where: { id: roomId } });
    if (!room) {
      throw new NotFoundException('Room not found');
    }
    const existing = await this.memberRepository.findOne({
      where: { roomId, userId },
    });
    if (!existing) {
      const member = this.memberRepository.create({ roomId, userId });
      await this.memberRepository.save(member);
    }
    return room;
  }

  async findRoomById(id: string): Promise<Room | null> {
    return this.roomRepository.findOne({ where: { id }, relations: ['members'] });
  }

  async listRooms(limit = 20, offset = 0): Promise<Room[]> {
    return this.roomRepository.find({
      take: limit,
      skip: offset,
      order: { createdAt: 'DESC' },
    });
  }
}

