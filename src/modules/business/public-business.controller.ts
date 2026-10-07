import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BusinessService } from './business.service.js';

// Unauthenticated lookups for the public site (e.g. registration form)
@ApiTags('Business - Public')
@Controller('app/business')
export class PublicBusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Get('industry-type')
  async findAllIndustryType() {
    return this.businessService.publicFindAllIndustryType();
  }
}
