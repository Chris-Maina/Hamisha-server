import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.table('payments', tbl => {
    tbl.integer('amount');
  });
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.table("payments", tbl => {
    tbl.dropColumn("amount");
  });
}
