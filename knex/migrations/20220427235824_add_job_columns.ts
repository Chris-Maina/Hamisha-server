import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
  return await knex.schema.table("jobs", tbl => {
    tbl.string("collection_day");
    tbl.dateTime("start_date");
    tbl.dateTime("end_date");
    tbl.integer("quantity");
    tbl.dropColumn("collection_date");
    tbl.dropColumn("expected_duration");
  });
}


export async function down(knex: Knex): Promise<void> {
  return await knex.schema.table("jobs", tbl => {
    tbl.dropColumn("collection_day");
    tbl.dropColumn("start_date");
    tbl.dropColumn("end_date");
    tbl.dropColumn("quantity");
    tbl.dateTime("collection_date");
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
  });
}

