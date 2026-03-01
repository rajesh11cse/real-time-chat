// GraphQL resolver for authentication
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { AuthPayload } from './auth.types';
import { UserService } from '../users/user.service';
import { RegisterInput } from '../users/dto/register.input';
import { LoginInput } from '../users/dto/login.input';

@Resolver()
export class AuthResolver {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Mutation(() => AuthPayload)
  async register(@Args('input') input: RegisterInput): Promise<AuthPayload> {
    const user = await this.userService.createUser(
      input.username,
      input.displayName,
      input.password,
    );
    const { accessToken } = await this.authService.login(user);
    return { accessToken, user };
  }

  @Mutation(() => AuthPayload)
  async login(@Args('input') input: LoginInput): Promise<AuthPayload> {
    const user = await this.authService.validateUser(input.username, input.password);
    const { accessToken } = await this.authService.login(user);
    return { accessToken, user };
  }
}

