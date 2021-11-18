import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.table("vehicles", tbl => {
    tbl.integer("mover_id").references("movers.id").onDelete("CASCADE").onUpdate("CASCADE");
  });
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.table("movers", tbl => {
    tbl.dropForeign(["mover_id"]);
    tbl.dropColumn("mover_id");
  });
}

