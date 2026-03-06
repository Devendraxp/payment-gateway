import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { CircuitBreakerService } from './circuit-breaker.service';
import { InternalApiGuard } from '../common/guards/internal-api.guard';
import { CircuitBreakerState } from './circuit-breaker.service';

@Controller('circuit-breaker')
export class CircuitBreakerController {
  constructor(private readonly cbService: CircuitBreakerService) {}

  @Get('status')
  async getAllStatus() {
    const allStatus = await this.cbService.getAllCircuitBreakerStates();
    return { status: 'success', data: allStatus };
  }

  @Post('force-open/:gateway/:method')
  @UseGuards(InternalApiGuard)
  async forceOpen(
    @Param('gateway') gateway: string,
    @Param('method') method: string,
  ) {
    await this.cbService.setState(gateway, method, {state: 'OPEN', failureCount: 0, lastFailureAt: Date.now(), probeCount: 0});
    return { status: 'OPEN forced' };
  }

  @Post('force-close/:gateway/:method')
  @UseGuards(InternalApiGuard)
  async forceClose(
    @Param('gateway') gateway: string,
    @Param('method') method: string,
  ) {
    await this.cbService.setState(gateway, method, {state: 'CLOSED', failureCount: 0, lastFailureAt: null, probeCount: 0});
    return { status: 'CLOSED forced' };
  }
}
