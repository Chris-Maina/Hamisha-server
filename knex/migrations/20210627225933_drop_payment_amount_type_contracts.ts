import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.table("contracts", tbl => {
    tbl.dropColumn("payment_amount");
    tbl.dropColumn("payment_type");
  })
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.table("contracts", tbl => {
    tbl.integer("payment_amount");
    tbl.integer('payment_type').references('payment_types.id').onDelete('CASCADE').onUpdate('CASCADE');
  })
}

