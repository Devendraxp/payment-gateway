import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { sleep } from '../common/utils/sleep.util';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class GatewaySimulatorService {
  constructor(private prisma: PrismaService) {}

  async callGateway(gatewayName: string, amount: number) {
    const gateway = await this.prisma.gateway.findUnique({
      where: { name: gatewayName },
    });

    if (!gateway || !gateway.is_active) {
      throw new Error(`Gateway ${gatewayName} is unavailable`);
    }

    const jitter = Math.random() * 200;
    const latency = gateway.base_latency_ms + jitter;
    await sleep(latency);

    // 5% chance of gateway timeout Hardcoded
    if (Math.random() < 0.05) {
      return {
        status: 'TIMEOUT',
        latency_ms: latency,
        error_code: 'GATEWAY_TIMEOUT',
      };
    }

    const isSuccessful = Math.random() < gateway.success_rate;

    if (isSuccessful) {
      return {
        status: 'SUCCESS',
        gateway_txn_id: `txn_${uuidv4()}`,
        latency_ms: latency,
      };
    } else {
      const errors = ['INSUFFICIENT_FUNDS', 'BANK_DOWN', 'INVALID_CARD'];
      const randomError = errors[Math.floor(Math.random() * errors.length)];

      return {
        status: 'FAILED',
        error_code: randomError,
        latency_ms: latency,
      };
    }
  }
}
