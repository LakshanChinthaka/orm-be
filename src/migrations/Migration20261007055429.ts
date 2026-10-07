import { Migration } from '@mikro-orm/migrations';

export class Migration20261007055429 extends Migration {

  override name = 'Migration20261007055429';

  override up(): void | Promise<void> {
    this.addSql(`alter table "address" alter column "postal_code" drop not null;`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "address" alter column "postal_code" set not null;`);
  }

}
