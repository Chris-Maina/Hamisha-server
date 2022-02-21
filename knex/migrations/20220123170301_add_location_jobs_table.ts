import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
  return await knex.schema.table("jobs", tbl => {
    tbl.string('location');
  });
}


export async function down(knex: Knex): Promise<void> {
  return await knex.schema.table('jobs', tbl => {
    tbl.dropColumn('location')
  });
}
