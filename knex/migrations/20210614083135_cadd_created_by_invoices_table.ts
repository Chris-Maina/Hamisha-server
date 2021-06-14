import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.table('invoices', tbl => {
    tbl.renameColumn('user_id', 'issued_by');
    tbl.integer('issued_to').references('users.id').onDelete('CASCADE').onUpdate('CASCADE');
  });
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.table('billings', tbl => {
    tbl.renameColumn('issued_by', 'user_id');
    tbl.dropColumn('issued_to');
  });
}

