import { Migration } from '@mikro-orm/migrations';

export class Migration20261006113332 extends Migration {

  override name = 'Migration20261006113332';

  override up(): void | Promise<void> {
    this.addSql(`alter table "app_user" drop constraint "app_user_subscription_plan_id_foreign";`);

    this.addSql(`alter table "role_permission" drop constraint "role_permission_permission_module_unique";`);
    this.addSql(`alter table "role_permission" alter column "permission_name" type varchar(100) using ("permission_name"::varchar(100));`);
    this.addSql(`create index "idx_permission_name" on "role_permission" ("permission_name");`);
    this.addSql(`create index "idx_permission_module" on "role_permission" ("permission_module");`);

    // Add nullable first, backfill existing rows from the display name, then enforce not null
    this.addSql(`alter table "user_role" add "role_slug" varchar(50) null;`);
    this.addSql(`update "user_role" set "role_slug" = trim(both '_' from lower(regexp_replace(trim("user_role"), '[^a-zA-Z0-9]+', '_', 'g'))) where "role_slug" is null;`);
    this.addSql(`alter table "user_role" alter column "role_slug" set not null;`);
    this.addSql(`create index "idx_user_role_slug" on "user_role" ("role_slug");`);
    this.addSql(`alter table "user_role" add constraint "user_role_role_slug_unique" unique ("role_slug");`);

    this.addSql(`alter table "app_user" add constraint "app_user_subscription_plan_id_foreign" foreign key ("subscription_plan_id") references "subscription_plan" ("subscription_plan_id") on delete set null;`);
    this.addSql(`create index "idx_app_user_email" on "app_user" ("user_email");`);
    this.addSql(`create index "idx_app_user_auth_lookup" on "app_user" ("user_id", "is_active", "deleted_at");`);

    this.addSql(`alter table "staff" add constraint "staff_username_unique" unique ("username");`);

    this.addSql(`create index "idx_user_session_refresh_token_hash" on "user_session" ("refresh_token_hash");`);
    this.addSql(`create index "idx_user_session_is_revoked" on "user_session" ("is_revoked");`);
    this.addSql(`create index "idx_user_session_user_lookup" on "user_session" ("user_id", "is_revoked");`);
    this.addSql(`create index "idx_user_session_staff_lookup" on "user_session" ("staff_id", "is_revoked");`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "app_user" drop constraint "app_user_subscription_plan_id_foreign";`);

    this.addSql(`drop index "idx_app_user_email";`);
    this.addSql(`drop index "idx_app_user_auth_lookup";`);
    this.addSql(`alter table "app_user" add constraint "app_user_subscription_plan_id_foreign" foreign key ("subscription_plan_id") references "subscription_plan" ("subscription_plan_id");`);

    this.addSql(`alter table "role_has_permission" drop constraint "role_has_permission_pkey";`);

    this.addSql(`drop index "idx_permission_name";`);
    this.addSql(`drop index "idx_permission_module";`);
    this.addSql(`alter table "role_permission" alter column "permission_name" type varchar(50) using ("permission_name"::varchar(50));`);
    this.addSql(`alter table "role_permission" add constraint "role_permission_permission_module_unique" unique ("permission_module");`);

    this.addSql(`alter table "staff" drop constraint "staff_username_unique";`);

    this.addSql(`alter table "subscription_has_feature" drop constraint "subscription_has_feature_pkey";`);

    this.addSql(`drop index "idx_user_role_slug";`);
    this.addSql(`alter table "user_role" drop constraint "user_role_role_slug_unique";`);
    this.addSql(`alter table "user_role" drop column "role_slug";`);

    this.addSql(`drop index "idx_user_session_refresh_token_hash";`);
    this.addSql(`drop index "idx_user_session_is_revoked";`);
    this.addSql(`drop index "idx_user_session_user_lookup";`);
    this.addSql(`drop index "idx_user_session_staff_lookup";`);
  }

}
