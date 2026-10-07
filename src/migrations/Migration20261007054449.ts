import { Migration } from '@mikro-orm/migrations';

export class Migration20261007054449 extends Migration {

  override name = 'Migration20261007054449';

  override up(): void | Promise<void> {
    this.addSql(`create table "country" ("country_id" uuid not null default gen_random_uuid(), "country_name" varchar(100) not null, "country_code" varchar(4) not null, "is_active" boolean not null default true, "created_at" timestamptz not null default now(), primary key ("country_id"));`);
    this.addSql(`alter table "country" add constraint "country_country_name_unique" unique ("country_name");`);
    this.addSql(`alter table "country" add constraint "country_country_code_unique" unique ("country_code");`);

    this.addSql(`create table "address" ("address_id" uuid not null default gen_random_uuid(), "country_id" uuid not null, "address_line_1" varchar(255) not null, "address_line_2" varchar(255) null, "city" varchar(170) not null, "region" varchar(50) null, "postal_code" varchar(20) not null, "is_active" boolean not null default true, "created_at" timestamptz not null default now(), primary key ("address_id"));`);

    this.addSql(`alter table "address" add constraint "address_country_id_foreign" foreign key ("country_id") references "country" ("country_id") on delete no action;`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "address" drop constraint "address_country_id_foreign";`);

    this.addSql(`drop table if exists "country" cascade;`);
    this.addSql(`drop table if exists "address" cascade;`);
  }

}
