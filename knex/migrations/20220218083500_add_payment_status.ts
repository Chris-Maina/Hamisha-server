import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.table("payments", tbl => {
    tbl.string("status");
  })
}


export async function down(knex: Knex): Promise<void> {
  return await knex.schema.table("payments", tbl => {
    tbl.dropColumn("status")
  });
}
