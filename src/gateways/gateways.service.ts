import { Injectable, ConflictException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateGatewayDto } from './dto/create-gateway.dto';
import { UpdateGatewayDto } from './dto/update-gateway.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class GatewaysService {
  constructor(private prisma: PrismaService) {}

  create(createGatewayDto: CreateGatewayDto) {
    const {
      name,
      display_name,
      is_active,
      success_rate,
      base_latency_ms,
      supported_methods,
      method_affinity,
      bank_affinity,
    } = createGatewayDto;
    try {
      const newGateway = this.prisma.gateway.create({
        data: {
          name,
          display_name,
          is_active,
          success_rate,
          base_latency_ms,
          supported_methods,
          method_affinity,
          bank_affinity,
        },
      });
      return newGateway;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          `Gateway with the name ${name} already exists`,
        );
      }
      throw new InternalServerErrorException('Failed to create gateway');
    }
  }

  findAll() {
    try {
      const gateways = this.prisma.gateway.findMany();
      return gateways;
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch gateways');
    }
  }

  findOne(id: string) {
    try {
      const gateway = this.prisma.gateway.findUnique({
        where: { id },
      });
      if (!gateway) {
        throw new NotFoundException(`Gateway with id ${id} not found`);
      }
      return gateway;
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch gateway');
    }
  }

  update(id: string, updateGatewayDto: UpdateGatewayDto) {
    try {
      const updatedGateway = this.prisma.gateway.update({
        where: { id },
        data: updateGatewayDto,
      });
      return updatedGateway;
    } catch (error) {
      throw new InternalServerErrorException('Failed to update gateway');
    }
  }

  remove(id: string) {
    try {
      const deletedGateway = this.prisma.gateway.delete({
        where: { id },
      });
      return deletedGateway;
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete gateway');
    }
  }
}
