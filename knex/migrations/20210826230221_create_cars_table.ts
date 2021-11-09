import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('vehicles', tbl => {
    tbl.string('reg_number').primary();
    tbl.string('vehicle_type');
    tbl.string('vehicle_pic');
  });
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('vehicles');
}

