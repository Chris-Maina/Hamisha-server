import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('contracts', tbl => {
    tbl.increments();
    tbl.integer('payment_amount');
    tbl.dateTime('start_time');
    tbl.dateTime('end_time');
  })
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('contracts');
}

