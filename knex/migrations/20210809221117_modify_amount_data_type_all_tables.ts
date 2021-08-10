import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('jobs', tbl => {
    tbl.decimal('payment_amount', 14, 2).alter();
  });
  await knex.schema.alterTable('payments', tbl => {
    tbl.decimal('amount', 14, 2).alter();
  });
  await knex.schema.alterTable('proposals', tbl => {
    tbl.decimal('payment_amount', 14, 2).alter();
  });
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('jobs', tbl => {
    tbl.integer('payment_amount').alter();
  });
  await knex.schema.alterTable('payments', tbl => {
    tbl.integer('amount').alter();
  });
  await knex.schema.alterTable('proposals', tbl => {
    tbl.integer('payment_amount').alter();
  });
}

