import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.table('jobs', tbl => {
    tbl.integer('customer_id').references('customers.id').onDelete('CASCADE').onUpdate('CASCADE');
    tbl.integer('payment_type').references('payment_types.id').onDelete('CASCADE').onUpdate('CASCADE');
  })
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.table('jobs', tbl => {
    tbl.dropColumn('customer_id');
    tbl.dropColumn('payment_type');
  });
}

