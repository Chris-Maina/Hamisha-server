import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.table('messages', tbl => {
    tbl.dropColumn('customer_id');
    tbl.dropColumn('mover_id');
    tbl.integer('user_id').references('users.id').onDelete('CASCADE').onUpdate('CASCADE');
  });
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.table('messages', tbl => {
    tbl.integer('customer_id').references('customers.id').onDelete('CASCADE').onUpdate('CASCADE');
    tbl.integer('mover_id').references('movers.id').onDelete('CASCADE').onUpdate('CASCADE');
    tbl.dropColumn('user_id');
  })
}

