import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('payments', tbl => {
    tbl.text('phone_number').alter();
  });
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('payments', tbl => {
    tbl.integer('phone_number').alter();
  });
}
