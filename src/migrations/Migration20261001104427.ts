import { Migration } from '@mikro-orm/migrations';

export class Migration20261001104427 extends Migration {

  override name = 'Migration20261001104427';

  override up(): void | Promise<void> {
    this.addSql(`create table "industry_type" ("industry_id" uuid not null default gen_random_uuid(), "industry_name" varchar(100) not null, "is_active" boolean not null default true, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), primary key ("industry_id"));`);
    this.addSql(`alter table "industry_type" add constraint "industry_type_industry_name_unique" unique ("industry_name");`);

    this.addSql(`create table "payment_method" ("payment_method_id" uuid not null default gen_random_uuid(), "payment_method" varchar(30) not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), primary key ("payment_method_id"));`);
    this.addSql(`alter table "payment_method" add constraint "payment_method_payment_method_unique" unique ("payment_method");`);

    this.addSql(`create table "subscription" ("subscription_id" uuid not null default gen_random_uuid(), "user_id" uuid not null, "subscription_plan_price_id" uuid not null, "payment_method_id" uuid not null, "trial_start_at" timestamptz null, "trial_end_at" timestamptz null, "billing_start_at" timestamptz not null, "next_billing_date" timestamptz not null, "last_billing_date" timestamptz null, "cancelled_at" timestamptz null, "paused_until" timestamptz null, "last_pay_amount" numeric(12,2) not null, "display_id" varchar(20) not null, "is_active" boolean not null default true, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), primary key ("subscription_id"));`);
    this.addSql(`alter table "subscription" add constraint "subscription_user_id_unique" unique ("user_id");`);
    this.addSql(`alter table "subscription" add constraint "subscription_display_id_unique" unique ("display_id");`);

    this.addSql(`create table "business" ("business_id" uuid not null default gen_random_uuid(), "industry_id" uuid not null, "subscription_id" uuid not null, "display_id" varchar(20) not null, "business_name" varchar(150) not null, "business_email" varchar(255) null, "business_contact_no" varchar(50) not null, "is_active" boolean not null default true, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, primary key ("business_id"));`);
    this.addSql(`alter table "business" add constraint "business_display_id_unique" unique ("display_id");`);

    this.addSql(`create table "business_meta" ("business_meta_id" uuid not null default gen_random_uuid(), "business_id" uuid not null, "tax_id" varchar(100) null, "profile_link" varchar(500) null, "about_us" varchar(1000) null, "is_operation" boolean not null default true, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), primary key ("business_meta_id"));`);
    this.addSql(`alter table "business_meta" add constraint "business_meta_business_id_unique" unique ("business_id");`);

    this.addSql(`alter table "subscription" add constraint "subscription_user_id_foreign" foreign key ("user_id") references "app_user" ("user_id") on delete no action;`);
    this.addSql(`alter table "subscription" add constraint "subscription_subscription_plan_price_id_foreign" foreign key ("subscription_plan_price_id") references "subscription_plan_price" ("subscription_plan_price_id") on delete no action;`);
    this.addSql(`alter table "subscription" add constraint "subscription_payment_method_id_foreign" foreign key ("payment_method_id") references "payment_method" ("payment_method_id") on delete no action;`);
    this.addSql(`alter table "subscription" add constraint "subscription_last_pay_amount_check" check (last_pay_amount >= 0);`);

    this.addSql(`alter table "business" add constraint "business_industry_id_foreign" foreign key ("industry_id") references "industry_type" ("industry_id") on delete no action;`);
    this.addSql(`alter table "business" add constraint "business_subscription_id_foreign" foreign key ("subscription_id") references "subscription" ("subscription_id") on delete no action;`);

    this.addSql(`alter table "business_meta" add constraint "business_meta_business_id_foreign" foreign key ("business_id") references "business" ("business_id") on delete cascade;`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "business" drop constraint "business_industry_id_foreign";`);
    this.addSql(`alter table "subscription" drop constraint "subscription_payment_method_id_foreign";`);
    this.addSql(`alter table "business" drop constraint "business_subscription_id_foreign";`);
    this.addSql(`alter table "business_meta" drop constraint "business_meta_business_id_foreign";`);

    this.addSql(`drop table if exists "industry_type" cascade;`);
    this.addSql(`drop table if exists "payment_method" cascade;`);
    this.addSql(`drop table if exists "subscription" cascade;`);
    this.addSql(`drop table if exists "business" cascade;`);
    this.addSql(`drop table if exists "business_meta" cascade;`);

    this.addSql(`alter table "role_has_permission" drop constraint "role_has_permission_pkey";`);

    this.addSql(`alter table "subscription_has_feature" drop constraint "subscription_has_feature_pkey";`);
  }

}
