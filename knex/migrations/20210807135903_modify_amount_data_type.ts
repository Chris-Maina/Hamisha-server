import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('invoices', tbl => {
    tbl.decimal('total', 14, 2).alter();
  });
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('invoices', tbl => {
    tbl.integer('total').alter();
  });
}

