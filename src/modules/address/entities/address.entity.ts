import { defineEntity, p } from '@mikro-orm/postgresql';
import { Country } from './country.entity.js';

const addressSchema = defineEntity({
  name: 'Address',
  tableName: 'address',
  properties: {
    id: p
      .uuid()
      .primary()
      .fieldName('address_id')
      .defaultRaw('gen_random_uuid()'),
    countryId: () =>
      p
        .manyToOne(Country)
        .mapToPk()
        .joinColumn('country_id')
        .deleteRule('no action'),
    addressLine1: p.string().length(255).fieldName('address_line_1'),
    addressLine2: p.string().length(255).nullable().fieldName('address_line_2'),
    city: p.string().length(170).fieldName('city'),
    region: p.string().length(50).nullable().fieldName('region'),
    postalCode: p.string().length(20).nullable().fieldName('postal_code'),
    isActive: p.boolean().default(true).fieldName('is_active'),
    createdAt: p.datetime().defaultRaw('now()').fieldName('created_at'),
  },
});

export class Address extends addressSchema.class {}
addressSchema.setClass(Address);
