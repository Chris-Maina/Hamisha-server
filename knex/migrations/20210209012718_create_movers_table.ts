import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('movers', tbl => {
    tbl.increments();
    tbl.string('location');
    tbl.string('description');
    tbl.dateTime('created_at').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP'));
    tbl.dateTime('updated_at');
  })
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('movers');
}

