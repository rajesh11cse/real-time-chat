// TypeORM entity and GraphQL type for Chat Room
import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RoomMember } from './room-member.entity';
import { Message } from '../messages/message.entity';

@ObjectType()
@Entity({ name: 'rooms' })
export class Room {
  @Field(() => ID)
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id!: string;

  @Field()
  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Field(() => ID)
  @Column({ name: 'created_by', type: 'bigint' })
  createdBy!: string;

  @Field()
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @Field(() => [RoomMember])
  @OneToMany(() => RoomMember, (member) => member.room)
  members!: RoomMember[];

  @OneToMany(() => Message, (message) => message.room)
  messages!: Message[];
}

