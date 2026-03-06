import { Injectable, OnModuleInit } from '@nestjs/common';
import { CircuitBreakerService } from './circuit-breaker.service';
import { GatewaysService } from '../gateways/gateways.service';

@Injectable()
export class CircuitBreakerInitializer implements OnModuleInit {
  constructor(
    private readonly circuitBreaker: CircuitBreakerService,
    private readonly gatewaysService: GatewaysService,
  ) {}

  async onModuleInit() {
    const gateways = await this.gatewaysService.findAllActive();
    for (const gateway of gateways) {
      const methods = gateway.supported_methods;
      if (Array.isArray(methods)) {
        for (const method of methods) {
          const key = this.circuitBreaker.getKey(gateway.name, method as string);
          await this.circuitBreaker.setState(gateway.name, method as string, {
            state: 'CLOSED',
            failureCount: 0,
            lastFailureAt: null,
            probeCount: 0,
          });
        }
      }
    }
  }
}
