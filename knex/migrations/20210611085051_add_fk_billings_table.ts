import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.table('billings', tbl => {
    tbl.integer('invoice_id').references('invoices.id').onDelete('CASCADE').onUpdate('CASCADE');
  });
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.table('billings', tbl => {
    tbl.dropColumn('invoice_id');
  });
}

