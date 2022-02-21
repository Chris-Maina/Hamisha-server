import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
  return await knex.schema.table('jobs', tbl => {
    tbl.dropForeign(["payment_type"]);
    tbl.dropColumn('payment_type');
  });
}


export async function down(knex: Knex): Promise<void> {
  return await knex.schema.table('jobs', tbl => {
    tbl.integer('payment_type').references('payment_types.id').onDelete('CASCADE').onUpdate('CASCADE');
  })
}
