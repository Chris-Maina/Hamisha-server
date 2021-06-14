import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("invoices", tbl => {
    tbl.increments();
    tbl.integer("user_id").references("users.id").onDelete("CASCADE").onUpdate("CASCADE");
    tbl.string("description");
    tbl.dateTime("created_at").notNullable().defaultTo(knex.raw("CURRENT_TIMESTAMP"));
    tbl.dateTime("updated_at");
    tbl.dateTime("due_date");
    tbl.integer("total");
    tbl.integer("contract_id").references("contracts.id").onDelete("CASCADE").onUpdate("CASCADE");
  });
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("invoices");
}

