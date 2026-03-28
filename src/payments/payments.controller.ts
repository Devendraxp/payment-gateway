import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.create(createPaymentDto);
  }

  @Get()
  findAll() {
    return this.paymentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }
  @Get('idempotency-key/:idempotency_key')
  findByIdempotencyKey(@Param('idempotency_key') idempotency_key: string) {
    return this.paymentsService.findByIdempotencyKey(idempotency_key);
  }
  @Get(':id/routing-decision')
  findRoutungDecision(@Param('id') id: string) {
    return this.paymentsService.findRoutungDecision(id);
  }
  @Get(':id/final-gateway')
  findFinalGateway(@Param('id') id: string) {
    return this.paymentsService.findFinalGateway(id);
  }
  @Get(':id/attempts')
  findAttempts(@Param('id') id: string) {
    return this.paymentsService.findAttempts(id);
  }


  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto) {
    return this.paymentsService.update(id, updatePaymentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.paymentsService.remove(id);
  }
}
