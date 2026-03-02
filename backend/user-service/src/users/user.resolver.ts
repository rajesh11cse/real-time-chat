// GraphQL resolver for User queries
import { UseGuards } from '@nestjs/common';
import { Args, Int, Query, Resolver } from '@nestjs/graphql';
import { User } from './user.entity';
import { UserService } from './user.service';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @UseGuards(GqlAuthGuard)
  @Query(() => User, { nullable: true })
  async me(@CurrentUser() user: { userId: string }): Promise<User | null> {
    if (!user?.userId) {
      return null;
    }
    return this.userService.findById(user.userId);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => User, { nullable: true })
  async user(@Args('id') id: string): Promise<User | null> {
    return this.userService.findById(id);
  }

  @UseGuards(GqlAuthGuard)
  @Query(() => [User])
  async users(
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 20 }) limit: number,
    @Args('offset', { type: () => Int, nullable: true, defaultValue: 0 }) offset: number,
  ): Promise<User[]> {
    return this.userService.listUsers(limit, offset);
  }
}

