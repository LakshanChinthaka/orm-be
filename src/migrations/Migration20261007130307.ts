import { Migration } from '@mikro-orm/migrations';

export class Migration20261007130307 extends Migration {

  override name = 'Migration20261007130307';

  override up(): void | Promise<void> {
    this.addSql(`alter table "subscription_plan" add "is_featured" boolean not null default false;`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "subscription_plan" drop column "is_featured";`);
  }

}
