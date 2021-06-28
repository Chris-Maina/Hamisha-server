import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.table("users", tbl => {
    tbl.string('phone_number');
  });
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.table("users", tbl => {
    tbl.dropColumn('phone_number');
  })
}
