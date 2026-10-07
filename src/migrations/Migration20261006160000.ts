import { Migration } from '@mikro-orm/migrations';

// The entities declare composite primary keys on these join tables but the
// tables were created without them. Without a PK, duplicate mappings are
// possible, ON CONFLICT upserts fail, and every generated migration's down()
// tries to drop a pkey that doesn't exist.
export class Migration20261006160000 extends Migration {

  override name = 'Migration20261006160000';

  override up(): void | Promise<void> {
    this.addSql(`alter table "role_has_permission" add constraint "role_has_permission_pkey" primary key ("permission_id", "user_role_id");`);
    this.addSql(`alter table "subscription_has_feature" add constraint "subscription_has_feature_pkey" primary key ("subscription_feature_id", "subscription_plan_id");`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "role_has_permission" drop constraint "role_has_permission_pkey";`);
    this.addSql(`alter table "subscription_has_feature" drop constraint "subscription_has_feature_pkey";`);
  }

}
