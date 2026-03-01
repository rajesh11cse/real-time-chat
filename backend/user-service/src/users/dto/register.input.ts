// GraphQL input type for user registration
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class RegisterInput {
  @Field()
  username!: string;

  @Field()
  displayName!: string;

  @Field()
  password!: string;
}

