// AI-generated TypeORM entity and GraphQL type for Room Member
import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Room } from './room.entity';

@ObjectType()
@Entity({ name: 'room_members' })
export class RoomMember {
  @Field(() => ID)
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string;

  @Field(() => ID)
  @Column({ name: 'room_id', type: 'bigint' })
  roomId!: string;

  @Field(() => ID)
  @Column({ name: 'user_id', type: 'bigint' })
  userId!: string;

  @Field()
  @CreateDateColumn({ name: 'joined_at', type: 'timestamptz' })
  joinedAt!: Date;

  @ManyToOne(() => Room, (room) => room.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'room_id' })
  room!: Room;
}

