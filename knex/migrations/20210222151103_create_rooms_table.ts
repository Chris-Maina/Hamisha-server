import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('rooms', tbl => {
    tbl.increments();
    tbl.string('name');
  })
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('rooms');
}

