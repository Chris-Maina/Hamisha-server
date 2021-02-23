import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.table('contracts', tbl => {
    tbl.integer('proposal_id').references('jobs.id').onDelete('CASCADE').onUpdate('CASCADE');
    tbl.integer('customer_id').references('customers.id').onDelete('CASCADE').onUpdate('CASCADE');
    tbl.integer('mover_id').references('movers.id').onDelete('CASCADE').onUpdate('CASCADE');
    tbl.integer('payment_type').references('payment_types.id').onDelete('CASCADE').onUpdate('CASCADE');
  })
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.table('contracts', tbl => {
    tbl.dropColumn('proposal_id');
    tbl.dropColumn('customer_id');
    tbl.dropColumn('mover_id');
    tbl.dropColumn('payment_type');
  });
}

