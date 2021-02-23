import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.table('jobs', tbl => {
    tbl.string('title');
  });
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.table('jobs', tbl => {
    tbl.dropColumn('title')
  });
}

