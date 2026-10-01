import { defineEntity, p } from '@mikro-orm/postgresql';

const PaymentMethodSchema = defineEntity({
  name: 'PaymentMethod',
  tableName: 'payment_method',
  properties: {
    id: p
      .uuid()
      .primary()
      .fieldName('payment_method_id')
      .defaultRaw('gen_random_uuid()'),
    paymentMethod: p.string().length(30).unique().fieldName('payment_method'),
    createdAt: p.datetime().defaultRaw('now()').fieldName('created_at'),
    updatedAt: p.datetime().defaultRaw('now()').fieldName('updated_at'),
  },
});

export class PaymentMethod extends PaymentMethodSchema.class {}
PaymentMethodSchema.setClass(PaymentMethod);
