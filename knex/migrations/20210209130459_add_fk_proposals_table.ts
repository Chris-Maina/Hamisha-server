import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.table('proposals', tbl => {
    tbl.integer('job_id').references('jobs.id').onDelete('CASCADE').onUpdate('CASCADE');
    tbl.integer('mover_id').references('movers.id').onDelete('CASCADE').onUpdate('CASCADE');
    tbl.integer('payment_type').references('payment_types.id').onDelete('CASCADE').onUpdate('CASCADE');
  })
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.table('proposals', tbl => {
    tbl.dropForeign(["job_id"]);
    tbl.dropColumn('job_id');
    tbl.dropForeign(["mover_id"]);
    tbl.dropColumn('mover_id');
    tbl.dropForeign(["payment_type"]);
    tbl.dropColumn('payment_type');
  });
}

