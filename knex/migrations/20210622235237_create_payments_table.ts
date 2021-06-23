import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("payments", tbl => {
    tbl.string("mpesa_receipt_no").primary();
    tbl.integer("phone_number")
    tbl.integer("invoice_id").references("invoices.id").onDelete("CASCADE").onUpdate("CASCADE");
    tbl.dateTime("payment_date");
  });
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("payments");
}
