import { Module } from '@nestjs/common';
import { AdminPaymentController } from './admin-payment.controller.js';
import { PaymentService } from './payment.service.js';

@Module({
  controllers: [AdminPaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
