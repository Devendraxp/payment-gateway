import { Module } from '@nestjs/common';
import { GatewaysService } from './gateways.service';
import { GatewaysController } from './gateways.controller';
import { GatewaySimulatorService } from './gateway-simulator.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [GatewaysController],
  providers: [GatewaysService, GatewaySimulatorService],
  exports: [GatewaysService, GatewaySimulatorService],
  imports: [PrismaModule],
})
export class GatewaysModule {}
