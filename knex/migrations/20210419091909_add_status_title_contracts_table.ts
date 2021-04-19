import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.table("contracts", tbl => {
    tbl.string("title");
    tbl.string("status");
  })
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.table("contracts", tbl => {
    tbl.dropColumn("title");
    tbl.dropColumn("status")
  });
}
