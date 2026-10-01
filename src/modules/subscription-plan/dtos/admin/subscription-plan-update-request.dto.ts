import { PartialType } from '@nestjs/swagger';
import { SubscriptionPlanCreateRequest } from './subscription-plan-create-request.dto.js';

export class SubscriptionPlanUpdateRequestDto extends PartialType(
  SubscriptionPlanCreateRequest,
) {}
