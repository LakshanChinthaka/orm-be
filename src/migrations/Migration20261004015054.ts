import { Migration } from '@mikro-orm/migrations';

export class Migration20261004015054 extends Migration {

  override name = 'Migration20261004015054';

  override up(): void | Promise<void> {
    this.addSql(`create table "staff" ("staff_id" uuid not null default gen_random_uuid(), "user_role_id" uuid not null, "business_id" uuid not null, "display_id" varchar(20) not null, "business_role" varchar(150) not null, "staff_name" varchar(150) null, "staff_email" varchar(255) null, "username" varchar(100) not null, "hash_password" varchar(255) not null, "staff_contact_no" varchar(50) not null, "is_active" boolean not null default false, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, primary key ("staff_id"));`);
    this.addSql(`alter table "staff" add constraint "staff_display_id_unique" unique ("display_id");`);

    this.addSql(`alter table "user_session" add "staff_id" uuid null, add "user_type" varchar(20) not null;`);
    this.addSql(`alter table "user_session" add constraint "user_session_staff_id_foreign" foreign key ("staff_id") references "staff" ("staff_id") on delete cascade;`);
    this.addSql(`alter table "user_session" alter column "user_id" drop not null;`);

    this.addSql(`alter table "password_reset_token" add "staff_id" uuid null, add "user_type" varchar(20) not null;`);
    this.addSql(`alter table "password_reset_token" add constraint "password_reset_token_staff_id_foreign" foreign key ("staff_id") references "staff" ("staff_id") on delete cascade;`);
    this.addSql(`alter table "password_reset_token" alter column "user_id" drop not null;`);

    this.addSql(`alter table "staff" add constraint "staff_user_role_id_foreign" foreign key ("user_role_id") references "user_role" ("user_role_id");`);
    this.addSql(`alter table "staff" add constraint "staff_business_id_foreign" foreign key ("business_id") references "business" ("business_id") on delete no action;`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "user_session" drop constraint "user_session_staff_id_foreign";`);
    this.addSql(`alter table "password_reset_token" drop constraint "password_reset_token_staff_id_foreign";`);

    this.addSql(`drop table if exists "staff" cascade;`);

    this.addSql(`alter table "password_reset_token" drop column "staff_id", drop column "user_type";`);
    this.addSql(`alter table "password_reset_token" alter column "user_id" set not null;`);

    this.addSql(`alter table "role_has_permission" drop constraint "role_has_permission_pkey";`);

    this.addSql(`alter table "subscription_has_feature" drop constraint "subscription_has_feature_pkey";`);

    this.addSql(`alter table "user_session" drop column "staff_id", drop column "user_type";`);
    this.addSql(`alter table "user_session" alter column "user_id" set not null;`);
  }

}
