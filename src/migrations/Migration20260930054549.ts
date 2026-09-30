import { Migration } from '@mikro-orm/migrations';

export class Migration20260930054549 extends Migration {

  override name = 'Migration20260930054549';

  override up(): void | Promise<void> {
    this.addSql(`alter table "app_user" alter column "display_id" set default ('USR-' || lpad(nextval('app_user_display_id_seq'::regclass)::text, 6, '0'));`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "app_user" alter column "display_id" set default ('USR-'::text || lpad((nextval('app_user_display_id_seq'::regclass))::text, 6, '0'::text));`);

    this.addSql(`alter table "role_has_permission" drop constraint "role_has_permission_pkey";`);

    this.addSql(`alter table "subscription_has_feature" drop constraint "subscription_has_feature_pkey";`);
  }

}
