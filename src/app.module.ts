import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { PaymentsModule } from './payments/payments.module';
import { GatewaysModule } from './gateways/gateways.module';
import { CircuitBreakerModule } from './circuit-breaker/circuit-breaker.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [PrismaModule, PaymentsModule, GatewaysModule, CircuitBreakerModule, RedisModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
