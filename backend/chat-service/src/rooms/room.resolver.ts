// AI-generated GraphQL resolver for chat rooms and membership
import { UseGuards } from '@nestjs/common';
import { Args, Context, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Room } from './room.entity';
import { RoomService } from './room.service';
import { GqlAuthGuard } from '../security/gql-auth.guard';
import { CurrentUser } from '../security/current-user.decorator';

@Resolver(() => Room)
export class RoomResolver {
  constructor(private readonly roomService: RoomService) {}

  @UseGuards(GqlAuthGuard)
  @Query(() => Room, { nullable: true })
  async chatRoom(@Args('id') id: string): Promise<Room | null> {
    return this.roomService.findRoomById(id);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [Room])
  async chatRooms(
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 20 }) limit: number,
    @Args('offset', { type: () => Int, nullable: true, defaultValue: 0 }) offset: number,
  ): Promise<Room[]> {
    return this.roomService.listRooms(limit, offset);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Room)
  async createRoom(
    @Args('name') name: string,
    @CurrentUser() user: { userId: string },
  ): Promise<Room> {
    return this.roomService.createRoom(name, user.userId);
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Room)
  async joinRoom(
    @Args('roomId') roomId: string,
    @CurrentUser() user: { userId: string },
  ): Promise<Room> {
    return this.roomService.joinRoom(roomId, user.userId);
  }
}

