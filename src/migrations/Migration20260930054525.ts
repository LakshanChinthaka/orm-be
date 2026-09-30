import { Migration } from '@mikro-orm/migrations';

export class Migration20260930054525 extends Migration {

  override name = 'Migration20260930054525';

  override up(): void | Promise<void> {
    this.addSql(`drop table if exists "drizzle"."__drizzle_migrations" cascade;`);

    this.addSql(`alter table "subscription_plan" drop constraint "subscription_plan_subscription_status_id_subscription_status_su";`);

    this.addSql(`alter table "subscription_plan_price" drop constraint "subscription_plan_price_subscription_plan_id_subscription_plan_";`);

    this.addSql(`alter table "subscription_has_feature" drop constraint "subscription_has_feature_subscription_feature_id_subscription_f";`);
    this.addSql(`alter table "subscription_has_feature" drop constraint "subscription_has_feature_subscription_plan_id_subscription_plan";`);

    this.addSql(`alter table "role_has_permission" drop constraint "role_has_permission_permission_id_role_permission_permission_id";`);
    this.addSql(`alter table "role_has_permission" drop constraint "role_has_permission_user_role_id_user_role_user_role_id_fk";`);

    this.addSql(`alter table "app_user" drop constraint "app_user_hear_about_id_hear_about_hear_about_id_fk";`);
    this.addSql(`alter table "app_user" drop constraint "app_user_subscription_plan_id_subscription_plan_subscription_pl";`);
    this.addSql(`alter table "app_user" drop constraint "app_user_user_role_id_user_role_user_role_id_fk";`);
    this.addSql(`alter table "app_user" drop constraint "app_user_user_status_id_user_status_user_status_id_fk";`);

    this.addSql(`alter table "user_session" drop constraint "user_session_user_id_app_user_user_id_fk";`);

    this.addSql(`alter table "password_reset_token" drop constraint "password_reset_token_user_id_app_user_user_id_fk";`);

    this.addSql(`alter table "subscription_plan" drop constraint "trial_days_non_negative";`);
    this.addSql(`alter table "subscription_plan" add constraint "subscription_plan_subscription_status_id_foreign" foreign key ("subscription_status_id") references "subscription_status" ("subscription_status_id") on delete no action;`);
    this.addSql(`alter table "subscription_plan" add constraint "subscription_plan_trial_days_check" check (trial_days >= 0);`);

    this.addSql(`alter table "subscription_plan_price" drop constraint "amount_non_negative";`);
    this.addSql(`alter table "subscription_plan_price" add constraint "subscription_plan_price_subscription_plan_id_foreign" foreign key ("subscription_plan_id") references "subscription_plan" ("subscription_plan_id") on delete no action;`);
    this.addSql(`alter table "subscription_plan_price" add constraint "subscription_plan_price_amount_check" check (amount >= 0);`);

    this.addSql(`alter table "subscription_has_feature" add constraint "subscription_has_feature_subscription_plan_id_foreign" foreign key ("subscription_plan_id") references "subscription_plan" ("subscription_plan_id") on update cascade on delete cascade;`);
    this.addSql(`alter table "subscription_has_feature" add constraint "subscription_has_feature_subscription_feature_id_foreign" foreign key ("subscription_feature_id") references "subscription_feature" ("subscription_feature_id") on update cascade on delete cascade;`);

    this.addSql(`alter table "role_has_permission" add constraint "role_has_permission_permission_id_foreign" foreign key ("permission_id") references "role_permission" ("permission_id") on update cascade on delete cascade;`);
    this.addSql(`alter table "role_has_permission" add constraint "role_has_permission_user_role_id_foreign" foreign key ("user_role_id") references "user_role" ("user_role_id") on update cascade on delete cascade;`);

    this.addSql(`alter table "app_user" alter column "display_id" set default ('USR-' || lpad(nextval('app_user_display_id_seq'::regclass)::text, 6, '0'));`);
    this.addSql(`alter table "app_user" add constraint "app_user_user_role_id_foreign" foreign key ("user_role_id") references "user_role" ("user_role_id");`);
    this.addSql(`alter table "app_user" add constraint "app_user_subscription_plan_id_foreign" foreign key ("subscription_plan_id") references "subscription_plan" ("subscription_plan_id");`);
    this.addSql(`alter table "app_user" add constraint "app_user_hear_about_id_foreign" foreign key ("hear_about_id") references "hear_about" ("hear_about_id") on delete no action;`);
    this.addSql(`alter table "app_user" add constraint "app_user_user_status_id_foreign" foreign key ("user_status_id") references "user_status" ("user_status_id");`);

    this.addSql(`alter table "user_session" add constraint "user_session_user_id_foreign" foreign key ("user_id") references "app_user" ("user_id") on delete cascade;`);

    this.addSql(`alter table "password_reset_token" add constraint "password_reset_token_user_id_foreign" foreign key ("user_id") references "app_user" ("user_id") on delete cascade;`);

    this.addSql(`drop schema if exists "drizzle";`);
  }

  override down(): void | Promise<void> {
    this.addSql(`create schema if not exists "drizzle";`);
    this.addSql(`create table "drizzle"."__drizzle_migrations" ("id" serial primary key, "hash" text not null, "created_at" int8 null);`);

    this.addSql(`alter table "app_user" drop constraint "app_user_user_role_id_foreign";`);
    this.addSql(`alter table "app_user" drop constraint "app_user_subscription_plan_id_foreign";`);
    this.addSql(`alter table "app_user" drop constraint "app_user_hear_about_id_foreign";`);
    this.addSql(`alter table "app_user" drop constraint "app_user_user_status_id_foreign";`);

    this.addSql(`alter table "password_reset_token" drop constraint "password_reset_token_user_id_foreign";`);

    this.addSql(`alter table "role_has_permission" drop constraint "role_has_permission_permission_id_foreign";`);
    this.addSql(`alter table "role_has_permission" drop constraint "role_has_permission_user_role_id_foreign";`);

    this.addSql(`alter table "subscription_has_feature" drop constraint "subscription_has_feature_subscription_plan_id_foreign";`);
    this.addSql(`alter table "subscription_has_feature" drop constraint "subscription_has_feature_subscription_feature_id_foreign";`);

    this.addSql(`alter table "subscription_plan" drop constraint "subscription_plan_subscription_status_id_foreign";`);

    this.addSql(`alter table "subscription_plan_price" drop constraint "subscription_plan_price_subscription_plan_id_foreign";`);

    this.addSql(`alter table "user_session" drop constraint "user_session_user_id_foreign";`);

    this.addSql(`alter table "app_user" alter column "display_id" set default ('USR-'::text || lpad((nextval('app_user_display_id_seq'::regclass))::text, 6, '0'::text));`);
    this.addSql(`alter table "app_user" add constraint "app_user_hear_about_id_hear_about_hear_about_id_fk" foreign key ("hear_about_id") references "hear_about" ("hear_about_id") on update no action on delete no action;`);
    this.addSql(`alter table "app_user" add constraint "app_user_subscription_plan_id_subscription_plan_subscription_pl" foreign key ("subscription_plan_id") references "subscription_plan" ("subscription_plan_id") on update no action on delete no action;`);
    this.addSql(`alter table "app_user" add constraint "app_user_user_role_id_user_role_user_role_id_fk" foreign key ("user_role_id") references "user_role" ("user_role_id") on update no action on delete no action;`);
    this.addSql(`alter table "app_user" add constraint "app_user_user_status_id_user_status_user_status_id_fk" foreign key ("user_status_id") references "user_status" ("user_status_id") on update no action on delete no action;`);

    this.addSql(`alter table "password_reset_token" add constraint "password_reset_token_user_id_app_user_user_id_fk" foreign key ("user_id") references "app_user" ("user_id") on update no action on delete cascade;`);

    this.addSql(`alter table "role_has_permission" drop constraint "role_has_permission_pkey";`);
    this.addSql(`alter table "role_has_permission" add constraint "role_has_permission_permission_id_role_permission_permission_id" foreign key ("permission_id") references "role_permission" ("permission_id") on update no action on delete cascade;`);
    this.addSql(`alter table "role_has_permission" add constraint "role_has_permission_user_role_id_user_role_user_role_id_fk" foreign key ("user_role_id") references "user_role" ("user_role_id") on update no action on delete cascade;`);

    this.addSql(`alter table "subscription_has_feature" drop constraint "subscription_has_feature_pkey";`);
    this.addSql(`alter table "subscription_has_feature" add constraint "subscription_has_feature_subscription_feature_id_subscription_f" foreign key ("subscription_feature_id") references "subscription_feature" ("subscription_feature_id") on update no action on delete cascade;`);
    this.addSql(`alter table "subscription_has_feature" add constraint "subscription_has_feature_subscription_plan_id_subscription_plan" foreign key ("subscription_plan_id") references "subscription_plan" ("subscription_plan_id") on update no action on delete cascade;`);

    this.addSql(`alter table "subscription_plan" drop constraint "subscription_plan_trial_days_check";`);
    this.addSql(`alter table "subscription_plan" add constraint "subscription_plan_subscription_status_id_subscription_status_su" foreign key ("subscription_status_id") references "subscription_status" ("subscription_status_id") on update no action on delete no action;`);
    this.addSql(`alter table "subscription_plan" add constraint "trial_days_non_negative" check (trial_days >= 0);`);

    this.addSql(`alter table "subscription_plan_price" drop constraint "subscription_plan_price_amount_check";`);
    this.addSql(`alter table "subscription_plan_price" add constraint "subscription_plan_price_subscription_plan_id_subscription_plan_" foreign key ("subscription_plan_id") references "subscription_plan" ("subscription_plan_id") on update no action on delete no action;`);
    this.addSql(`alter table "subscription_plan_price" add constraint "amount_non_negative" check (amount >= 0);`);

    this.addSql(`alter table "user_session" add constraint "user_session_user_id_app_user_user_id_fk" foreign key ("user_id") references "app_user" ("user_id") on update no action on delete cascade;`);
  }

}
