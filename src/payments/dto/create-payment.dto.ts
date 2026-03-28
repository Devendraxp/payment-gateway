import { PaymentMethod, PaymentStatus } from "src/generated/prisma/client";

export class CreatePaymentDto {
    idempotency_key: string;
    merchant_id: string;
    customer_id: string;
    amount_minor: number;
    currency: string;
    payment_method: PaymentMethod;
    instrument: JSON;
}
