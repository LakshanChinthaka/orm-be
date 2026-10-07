import { Migration } from '@mikro-orm/migrations';

export class Migration20261001112157 extends Migration {

  override name = 'Migration20261001112157';

  override up(): void | Promise<void> {
    this.addSql(`alter table "subscription" alter column "last_pay_amount" drop not null;`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "role_has_permission" drop constraint "role_has_permission_pkey";`);

    this.addSql(`alter table "subscription" alter column "last_pay_amount" set not null;`);

    this.addSql(`alter table "subscription_has_feature" drop constraint "subscription_has_feature_pkey";`);
  }

}
