// TypeORM entity and GraphQL type for Message
import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Room } from '../rooms/room.entity';

@ObjectType()
@Entity({ name: 'messages' })
export class Message {
  @Field(() => ID)
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string;

  @Field(() => ID)
  @Column({ name: 'room_id', type: 'bigint' })
  roomId!: string;

  @Field(() => ID)
  @Column({ name: 'sender_id', type: 'bigint' })
  senderId!: string;

  @Field()
  @Column({ type: 'text' })
  content!: string;

  @Field()
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @ManyToOne(() => Room, (room) => room.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'room_id' })
  room!: Room;
}

