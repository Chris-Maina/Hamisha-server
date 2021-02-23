import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('proposals', tbl => {
    tbl.increments();
    tbl.integer('payment_amount');
    tbl.integer('customer_grade');
    tbl.string('customer_comment');
    tbl.integer('movers_grade');
    tbl.string('movers_comment');
    tbl.dateTime('created_at').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP'));
    tbl.enu(
      'status',
      [
        'proposal sent',
        'negotiation phase',
        'proposal withdrawn',
        'proposal rejected',
        'proposal accepted',
        'job started',
        'job finished(successfully)',
        'job finished(unsuccessfully)'
      ],
      { useNative: true, enumName: 'status' }
    );
  })
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('proposals');
}
