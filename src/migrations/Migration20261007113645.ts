import { Migration } from '@mikro-orm/migrations';

export class Migration20261007113645 extends Migration {

  override name = 'Migration20261007113645';

  override up(): void | Promise<void> {
    this.addSql(`create table "business_location_type" ("location_type_id" uuid not null default gen_random_uuid(), "location_type" varchar(100) not null, "is_active" boolean not null default false, "created_at" timestamptz not null default now(), primary key ("location_type_id"));`);
    this.addSql(`alter table "business_location_type" add constraint "business_location_type_location_type_unique" unique ("location_type");`);

    this.addSql(`create table "business_location" ("business_location_id" uuid not null default gen_random_uuid(), "location_type_id" uuid not null, "business_id" uuid not null, "address_id" uuid null, "display_id" varchar(20) not null, "location_name" varchar(150) not null, "business_location_email" varchar(255) null, "business_location_contact_no" varchar(50) null, "is_active" boolean not null default false, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, primary key ("business_location_id"));`);
    this.addSql(`alter table "business_location" add constraint "business_location_address_id_unique" unique ("address_id");`);
    this.addSql(`alter table "business_location" add constraint "business_location_display_id_unique" unique ("display_id");`);

    this.addSql(`alter table "business_location" add constraint "business_location_location_type_id_foreign" foreign key ("location_type_id") references "business_location_type" ("location_type_id") on delete no action;`);
    this.addSql(`alter table "business_location" add constraint "business_location_business_id_foreign" foreign key ("business_id") references "business" ("business_id") on delete no action;`);
    this.addSql(`alter table "business_location" add constraint "business_location_address_id_foreign" foreign key ("address_id") references "address" ("address_id") on delete set null;`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "business_location" drop constraint "business_location_location_type_id_foreign";`);

    this.addSql(`drop table if exists "business_location_type" cascade;`);
    this.addSql(`drop table if exists "business_location" cascade;`);
  }

}
