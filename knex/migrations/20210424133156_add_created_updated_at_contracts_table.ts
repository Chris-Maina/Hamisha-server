import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.table("contracts", tbl => {
    tbl.dateTime('updated_at');
    tbl.dateTime('created_at').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP'));
  });
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.table("contracts", tbl => {
    tbl.dropColumn("updated_at");
    tbl.dropColumn("created_at");
  });
}
