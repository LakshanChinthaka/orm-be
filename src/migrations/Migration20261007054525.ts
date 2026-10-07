import { Migration } from '@mikro-orm/migrations';

export class Migration20261007054525 extends Migration {

  override name = 'Migration20261007054525';

  override up(): void | Promise<void> {
    this.addSql(`alter table "subscription_has_feature" drop constraint "subscription_has_feature_pkey";`);
    this.addSql(`alter table "subscription_has_feature" add primary key ("subscription_plan_id", "subscription_feature_id");`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "subscription_has_feature" drop constraint "subscription_has_feature_pkey";`);
    this.addSql(`alter table "subscription_has_feature" add primary key ("subscription_feature_id", "subscription_plan_id");`);
  }

}
