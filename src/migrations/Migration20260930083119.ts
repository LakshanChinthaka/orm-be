import { Migration } from '@mikro-orm/migrations';

export class Migration20260930083119 extends Migration {

  override name = 'Migration20260930083119';

  override up(): void | Promise<void> {
    this.addSql(`alter table "subscription_plan" drop constraint "subscription_plan_subscription_name_unique";`);
    this.addSql(`alter table "subscription_plan" add "description" varchar(30);`);
    this.addSql(`update "subscription_plan" set "description" = left(lower(regexp_replace(coalesce("subscription_name", 'plan'), '[^a-zA-Z0-9]+', '-', 'g')), 30) where "description" is null;`);
    this.addSql(`alter table "subscription_plan" alter column "description" set not null;`);
    this.addSql(`alter table "subscription_plan" alter column "subscription_name" type varchar(1000) using ("subscription_name"::varchar(1000));`);
    this.addSql(`alter table "subscription_plan" alter column "subscription_name" drop not null;`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "role_has_permission" drop constraint "role_has_permission_pkey";`);

    this.addSql(`alter table "subscription_has_feature" drop constraint "subscription_has_feature_pkey";`);

    this.addSql(`alter table "subscription_plan" drop column "description";`);
    this.addSql(`alter table "subscription_plan" alter column "subscription_name" type varchar(30) using ("subscription_name"::varchar(30));`);
    this.addSql(`alter table "subscription_plan" alter column "subscription_name" set not null;`);
    this.addSql(`alter table "subscription_plan" add constraint "subscription_plan_subscription_name_unique" unique ("subscription_name");`);
  }

}
