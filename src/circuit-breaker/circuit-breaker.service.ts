import 'dotenv/config';
import { Injectable, Inject } from '@nestjs/common';
import { Redis } from 'ioredis';

export interface CircuitBreakerState {
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  failureCount: number;
  lastFailureAt: number | null;
  probeCount: number;
}


@Injectable()
export class CircuitBreakerService {
  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}
  
  getKey(gateway: string, method: string): string {
    return `circuit_breaker:${gateway}:${method}`;
  }

  private readonly FAILURE_THRESHOLD = process.env
    .CIRCUIT_BREAKER_FAILURE_THRESHOLD
    ? parseInt(process.env.CIRCUIT_BREAKER_FAILURE_THRESHOLD)
    : 5;
  private readonly RECOVERY_TIMEOUT = process.env
    .CIRCUIT_BREAKER_RECOVERY_TIMEOUT_MS
    ? parseInt(process.env.CIRCUIT_BREAKER_RECOVERY_TIMEOUT_MS)
    : 30000;
  private readonly PROBE_TRAFFIC = process.env.CIRCUIT_BREAKER_PROBE_TRAFFIC
    ? parseFloat(process.env.CIRCUIT_BREAKER_PROBE_TRAFFIC)
    : 0.1;

  async getState(
    gateway: string,
    method: string,
  ): Promise<CircuitBreakerState> {
    const key = this.getKey(gateway, method);
    const data = await this.redis.hgetall(key);

    return {
      state: (data.state as any) || 'CLOSED',
      failureCount: parseInt(data.failureCount) || 0,
      lastFailureAt: data.lastFailureAt ? parseInt(data.lastFailureAt) : null,
      probeCount: parseInt(data.probeCount) || 0,
    };
  }

  async setState(
    gateway: string,
    method: string,
    CircuitBreakerState: CircuitBreakerState,
  ): Promise<void> {
    const key = this.getKey(gateway, method);
    await this.redis.hmset(key, {
      state: CircuitBreakerState.state,
      failureCount: CircuitBreakerState.failureCount,
      lastFailureAt: CircuitBreakerState.lastFailureAt ?? '',
      probeCount: CircuitBreakerState.probeCount,
    });
  }

  async getAllCircuitBreakerKeys(): Promise<string[]> {
    const stream = this.redis.scanStream({
      match: 'circuit_breaker:*',
      count: 100,
    });
    const keys: string[] = [];
    for await (const resultKeys of stream) {
      keys.push(...resultKeys);
    }
    return keys;
  }

  async getAllCircuitBreakerStates(): Promise<{ gateway: string; method: string; state: CircuitBreakerState }[]> {
    const keys = await this.getAllCircuitBreakerKeys();
    const states : { gateway: string; method: string; state: CircuitBreakerState }[] = [];
    for (const key of keys) {
      const [_, gateway, method] = key.split(':');
      const state = await this.getState(gateway, method);
      states.push({ gateway, method, state });
    }
    return states;
  }

  async canRoute(gateway: string, method: string): Promise<boolean> {
    const stateObj = await this.getState(gateway, method);

    if (stateObj.state === 'OPEN') {
      if (
        stateObj.lastFailureAt &&
        Date.now() - stateObj.lastFailureAt > this.RECOVERY_TIMEOUT
      ) {
        await this.setState(gateway, method, {
          state: 'HALF_OPEN',
          failureCount: 0,
          lastFailureAt: null,
          probeCount: 0,
        });
      } else {
        return false;
      }
    }

    if (stateObj.state === 'HALF_OPEN') {
      return Math.random() < this.PROBE_TRAFFIC;
    }
    return true;
  }

  async recordResult(
    gateway: string,
    method: string,
    success: boolean,
  ): Promise<void> {
    const key = this.getKey(gateway, method);
    const stateObj = await this.getState(gateway, method);

    let { state, failureCount, lastFailureAt, probeCount } = stateObj;

    if (success) {
      if (state === 'HALF_OPEN') {
        await this.setState(gateway, method, {
          state: 'CLOSED',
          failureCount: 0,
          lastFailureAt: null,
          probeCount: 0,
        });
      } else if (state === 'CLOSED') {
        await this.setState(gateway, method, {
          state: 'CLOSED',
          failureCount: 0,
          lastFailureAt: null,
          probeCount: 0,
        });
      }
    } else {
      failureCount += 1;
      lastFailureAt = Date.now();

      if (state === 'CLOSED') {
        if (failureCount >= this.FAILURE_THRESHOLD) {
          state = 'OPEN';
        }
        await this.setState(gateway, method, {
          state,
          failureCount,
          lastFailureAt,
          probeCount: 0,
        });
      } else if (state === 'HALF_OPEN') {
        await this.setState(gateway, method, {
          state: 'OPEN',
          failureCount,
          lastFailureAt,
          probeCount: 0,
        });
      }
    }
  }
}
