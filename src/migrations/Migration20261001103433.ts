import { Migration } from '@mikro-orm/migrations';

export class Migration20261001103433 extends Migration {

  override name = 'Migration20261001103433';

  override up(): void | Promise<void> {
    this.addSql(`alter table "subscription_plan" add "deleted_at" timestamptz null;`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "role_has_permission" drop constraint "role_has_permission_pkey";`);

    this.addSql(`alter table "subscription_has_feature" drop constraint "subscription_has_feature_pkey";`);

    this.addSql(`alter table "subscription_plan" drop column "deleted_at";`);
  }

}
