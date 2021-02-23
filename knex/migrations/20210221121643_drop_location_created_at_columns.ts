import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.table('customers', tbl => {
    tbl.dropColumn('location');
  });
  await knex.schema.table('movers', tbl => {
    tbl.dropColumn('location');
  });
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.table('customers', tbl => {
    tbl.string('location');
  });
  await knex.schema.table('movers', tbl => {
    tbl.string('location');
  });
}

