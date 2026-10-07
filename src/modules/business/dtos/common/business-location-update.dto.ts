import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { AddressUpdateDto } from '../../../address/dtos/index.js';
import { BusinessLocationCreateRequestDto } from './business-location-create.dto.js';

export class BusinessLocationUpdateRequestDto extends PartialType(
  OmitType(BusinessLocationCreateRequestDto, ['address'] as const),
) {
  // Updates the linked address, or creates one if the location has none
  // (creating requires countryId, addressLine1 and city)
  @ValidateNested()
  @Type(() => AddressUpdateDto)
  @IsOptional()
  @ApiProperty({ type: () => AddressUpdateDto, required: false })
  address?: AddressUpdateDto;
}
