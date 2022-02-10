import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
  return await knex.schema.table("jobs", tbl => {
    tbl.dateTime('collection_date');
  });
}


export async function down(knex: Knex): Promise<void> {
  return await knex.schema.table("jobs", tbl => {
    tbl.dropColumn('collection_date');
  });
}

