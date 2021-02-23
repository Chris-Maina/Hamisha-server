import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('messages', tbl => {
    tbl.increments();
    tbl.string('text');
    tbl.dateTime('created_at').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP'));
    tbl.dateTime('updated_at');
  })
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('messages')
}

