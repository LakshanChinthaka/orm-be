import { Migration } from '@mikro-orm/migrations';

export class Migration20261006155655 extends Migration {

  override name = 'Migration20261006155655';

  override up(): void | Promise<void> {
    this.addSql(`create table "staff_has_permission" ("staff_id" uuid not null, "permission_id" uuid not null, "is_granted" boolean not null default true, primary key ("staff_id", "permission_id"));`);

    this.addSql(`alter table "staff_has_permission" add constraint "staff_has_permission_staff_id_foreign" foreign key ("staff_id") references "staff" ("staff_id") on update cascade on delete cascade;`);
    this.addSql(`alter table "staff_has_permission" add constraint "staff_has_permission_permission_id_foreign" foreign key ("permission_id") references "role_permission" ("permission_id") on update cascade on delete cascade;`);
  }

  override down(): void | Promise<void> {
    this.addSql(`drop table if exists "staff_has_permission" cascade;`);
  }

}
