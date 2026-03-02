// NestJS module for Message domain
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './message.entity';
import { MessageService } from './message.service';
import { MessageResolver } from './message.resolver';
import { JwtStrategy } from '../security/jwt.strategy';

@Module({
  imports: [TypeOrmModule.forFeature([Message])],
  providers: [MessageService, MessageResolver, JwtStrategy],
})
export class MessageModule {}

