import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("billings", tbl => {
    tbl.increments();
    tbl.integer("user_id").references("users.id").onDelete("CASCADE").onUpdate("CASCADE");
    tbl.string("status");
  });
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("billings");
}

