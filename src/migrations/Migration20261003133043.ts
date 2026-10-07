import { Migration } from '@mikro-orm/migrations';

export class Migration20261003133043 extends Migration {

  override name = 'Migration20261003133043';

  override up(): void | Promise<void> {
    this.addSql(`alter table "subscription_plan" alter column "description" type varchar(1000) using ("description"::varchar(1000));`);
    this.addSql(`alter table "subscription_plan" alter column "subscription_name" type varchar(30) using ("subscription_name"::varchar(30));`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "role_has_permission" drop constraint "role_has_permission_pkey";`);

    this.addSql(`alter table "subscription_has_feature" drop constraint "subscription_has_feature_pkey";`);

    this.addSql(`alter table "subscription_plan" alter column "subscription_name" type varchar(1000) using ("subscription_name"::varchar(1000));`);
    this.addSql(`alter table "subscription_plan" alter column "description" type varchar(30) using ("description"::varchar(30));`);
  }

}
