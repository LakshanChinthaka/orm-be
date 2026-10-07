import { PartialType } from '@nestjs/swagger';
import { AddressCreateDto } from './address-create.dto.js';

export class AddressUpdateDto extends PartialType(AddressCreateDto) {}
