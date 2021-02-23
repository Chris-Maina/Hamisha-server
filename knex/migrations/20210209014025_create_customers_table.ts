import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('customers', tbl => {
    tbl.increments();
    tbl.string('location');
    tbl.dateTime('created_at').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP'));
  })
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('customers');
}

