import { Body, Controller, Post } from '@nestjs/common';
import { PaymentService } from './payment.service.js';
import { PaymentTypeCreateDto } from './dtos/admin/payment-type-create.dto.js';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Payment - Admin Portal')
@Controller('admin/payment')
export class AdminPaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('type')
  async createPaymentType(@Body() dto: PaymentTypeCreateDto) {
    return this.paymentService.createIndustryType(dto);
  }
}
