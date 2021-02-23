import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('attachments', tbl => {
    tbl.increments();
    tbl.string('link');
  })
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('attachments')
}

