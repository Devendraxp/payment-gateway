import { PartialType } from '@nestjs/mapped-types';
import { CreatePaymentDto } from './create-payment.dto';
import { PaymentStatus } from 'src/generated/prisma/client';

export class UpdatePaymentDto extends PartialType(CreatePaymentDto) {
    final_gateway?: string;
    status?: PaymentStatus;
}
