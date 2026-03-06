import { Module } from '@nestjs/common';
import { CircuitBreakerService } from './circuit-breaker.service';
import { CircuitBreakerController } from './circuit-breaker.controller';
import { CircuitBreakerInitializer } from './circuit-breaker.initializer';
import { GatewaysModule } from 'src/gateways/gateways.module';

@Module({
  providers: [
    CircuitBreakerService,
    CircuitBreakerInitializer,
  ],
  imports: [GatewaysModule],
  controllers: [CircuitBreakerController],
  exports: [CircuitBreakerService],
})
export class CircuitBreakerModule {}
