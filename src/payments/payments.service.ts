import { Injectable } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaymentMethod, PaymentStatus } from 'src/generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async create(createPaymentDto: CreatePaymentDto) {
    const { idempotency_key, merchant_id, customer_id, amount_minor, currency, payment_method, instrument } = createPaymentDto;
    const payment = await this.prisma.payment.create({
      data: {
        idempotency_key,
        merchant_id,
        customer_id,
        amount_minor,
        currency,
        payment_method,
        instrument: instrument as any,
        status : PaymentStatus.PENDING
      }
    });
    return payment;

  }

  findAll() {
    const payments = this.prisma.payment.findMany();
    return payments;
  }

  findOne(id: string) {
    const payment = this.prisma.payment.findUnique({ where: { id } });
    return payment;
  }
  findByIdempotencyKey(idempotency_key: string) {
    const payment = this.prisma.payment.findUnique({ where: { idempotency_key } });
    return payment;
  }
  findRoutungDecision(id: string) {
    const routingDecisions = this.prisma.routingDecision.findMany({ where: { payment_id: id } });
    return routingDecisions;
  }
  findFinalGateway(id: string) {
    const payment = this.prisma.payment.findUnique({ where: { id } });
    return payment.then(p => p?.final_gateway);
  }
  findAttempts(id: string) {
    const attempts = this.prisma.paymentAttempt.findMany({ where: { payment_id: id } });
    return attempts;
  }

  update(id: string, updatePaymentDto: UpdatePaymentDto) {
    const { final_gateway,  } = updatePaymentDto;
    const payment = this.prisma.payment.update({
      where: { id },
      data: {
        final_gateway
      }
    });
    return payment;
  }

  remove(id: string) {
    const payment = this.prisma.payment.delete({ where: { id } });
    return payment;
  }
}
