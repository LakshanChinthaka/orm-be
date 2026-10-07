import { defineEntity, p } from '@mikro-orm/postgresql';

const countrySchema = defineEntity({
  name: 'Country',
  tableName: 'country',
  properties: {
    id: p
      .uuid()
      .primary()
      .fieldName('country_id')
      .defaultRaw('gen_random_uuid()'),
    countryName: p.string().length(100).unique().fieldName('country_name'),
    countryCode: p.string().length(4).unique().fieldName('country_code'),
    isActive: p.boolean().default(true).fieldName('is_active'),
    createdAt: p.datetime().defaultRaw('now()').fieldName('created_at'),
  },
});

export class Country extends countrySchema.class {}
countrySchema.setClass(Country);
