// AI-generated GraphQL resolver for messages, including subscriptions
import { Inject, UseGuards } from '@nestjs/common';
import {
  Args,
  Context,
  Int,
  Mutation,
  ObjectType,
  Field,
  Query,
  Resolver,
  Subscription,
} from '@nestjs/graphql';
import { Message } from './message.entity';
import { MessageService } from './message.service';
import { PUB_SUB } from '../subscriptions/pubsub.module';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { GqlAuthGuard } from '../security/gql-auth.guard';
import { CurrentUser } from '../security/current-user.decorator';

const MESSAGE_ADDED_TOPIC = 'MESSAGE_ADDED_TOPIC';

@ObjectType()
class MessageEdge {
  @Field()
  cursor!: string;

  @Field(() => Message)
  node!: Message;
}

@ObjectType()
class PageInfo {
  @Field()
  hasNextPage!: boolean;

  @Field({ nullable: true })
  endCursor?: string;
}

@ObjectType()
class MessageConnection {
  @Field(() => [MessageEdge])
  edges!: MessageEdge[];

  @Field(() => PageInfo)
  pageInfo!: PageInfo;
}

function encodeCursor(message: Message): string {
  return Buffer.from(`${message.createdAt.toISOString()}|${message.id}`).toString('base64');
}

function decodeCursor(cursor: string): { createdAt: Date; id: string } {
  const decoded = Buffer.from(cursor, 'base64').toString('utf8');
  const [createdAtStr, id] = decoded.split('|');
  return { createdAt: new Date(createdAtStr), id };
}

@Resolver(() => Message)
export class MessageResolver {
  constructor(
    private readonly messageService: MessageService,
    @Inject(PUB_SUB) private readonly pubSub: RedisPubSub,
  ) {}

  @UseGuards(GqlAuthGuard)
  @Query(() => MessageConnection)
  async messages(
    @Args('roomId') roomId: string,
    @Args('after', { type: () => String, nullable: true }) after?: string,
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 50 }) limit?: number,
  ): Promise<MessageConnection> {
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

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Message)
  async sendMessage(
    @Args('roomId') roomId: string,
    @Args('content') content: string,
    @CurrentUser() user: { userId: string },
  ): Promise<Message> {
    const message = await this.messageService.createMessage(roomId, user.userId, content);
    await this.pubSub.publish(MESSAGE_ADDED_TOPIC, {
      messageAdded: message,
      roomId,
    });
    return message;
  }

  @UseGuards(GqlAuthGuard)
  @Subscription(() => Message, {
    filter: (payload: any, variables: { roomId: string }) =>
      payload.roomId === variables.roomId,
    resolve: (payload: any) => payload.messageAdded,
  })
  messageAdded(@Args('roomId') _roomId: string) {
    return this.pubSub.asyncIterator(MESSAGE_ADDED_TOPIC);
  }
}

