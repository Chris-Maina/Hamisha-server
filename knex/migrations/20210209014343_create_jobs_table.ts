import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('jobs', tbl => {
    tbl.increments();
    tbl.string('description');
    tbl.integer('payment_amount');
    tbl.dateTime('created_at').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP'));
    tbl.dateTime('updated_at');
    tbl.enu(
      'expected_duration',
      [
        '1 day',
        '2-5 days',
        '5-10 days',
        'less than 1 month',
        '1-3 months',
        '3-6 months',
        '6 or more months',
      ],
      { useNative: true, enumName: 'expected_duration' }
    );
  })
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('jobs');
}
