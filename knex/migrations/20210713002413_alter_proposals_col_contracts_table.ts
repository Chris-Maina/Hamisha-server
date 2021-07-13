import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable("contracts", tbl => {
    tbl.dropForeign(["proposal_id"]);
    tbl.foreign("proposal_id").references("proposals.id").onDelete('CASCADE').onUpdate('CASCADE');
  });
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable("contracts", tbl => {
    tbl.dropForeign(["proposal_id"]);
    tbl.foreign("proposal_id").references('jobs.id').onDelete('CASCADE').onUpdate('CASCADE');
  });
}

