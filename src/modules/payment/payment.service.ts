import { ConflictException, Injectable } from '@nestjs/common';
import { IndustryType } from '../business/entities/industry-type.entity.js';
import {
  EntityManager,
  UniqueConstraintViolationException,
} from '@mikro-orm/postgresql';
import { PinoLogger } from 'nestjs-pino';
import { PaymentTypeCreateDto } from './dtos/index.js';
import { PaymentMethod } from './entities/payment-method.entity.js';

@Injectable()
export class PaymentService {
  constructor(
    private readonly em: EntityManager,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(PaymentService.name);
  }

  async createIndustryType(dto: PaymentTypeCreateDto) {
    try {
      const newType = this.em.create(PaymentMethod, {
        paymentMethod: dto.paymentMethod,
      });
      await this.em.flush();

      this.logger.info('Payment type created successfully');
      return newType;
    } catch (e: any) {
      if (e instanceof UniqueConstraintViolationException) {
        throw new ConflictException(`Payment type already exists`);
      }
      throw e;
    }
  }
}
