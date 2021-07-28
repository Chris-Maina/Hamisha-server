import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.table("users", tbl => {
    tbl.enu(
      'role',
      ['admin', 'customer', 'mover'],
      { useNative: true, enumName: 'role' }
    );
  });
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.table("users", tbl => {
    tbl.dropColumn('role');
  });
}
