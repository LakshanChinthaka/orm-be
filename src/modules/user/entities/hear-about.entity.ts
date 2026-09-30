import { defineEntity, p } from '@mikro-orm/postgresql';

const HearAboutSchema = defineEntity({
  name: 'HearAbout',
  tableName: 'hear_about',
  properties: {
    id: p
      .uuid()
      .primary()
      .fieldName('hear_about_id')
      .defaultRaw('gen_random_uuid()'),
    hearAboutName: p.string().length(30).unique().fieldName('hear_about_name'),
    isActive: p.boolean().default(true).fieldName('is_active'),
    createdAt: p.datetime().defaultRaw('now()').fieldName('created_at'),
  },
});

export class HearAbout extends HearAboutSchema.class {}
HearAboutSchema.setClass(HearAbout);
