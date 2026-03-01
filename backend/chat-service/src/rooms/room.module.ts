// NestJS module for Room domain
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Room } from './room.entity';
import { RoomMember } from './room-member.entity';
import { RoomService } from './room.service';
import { RoomResolver } from './room.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Room, RoomMember])],
  providers: [RoomService, RoomResolver],
  exports: [RoomService],
})
export class RoomModule {}

