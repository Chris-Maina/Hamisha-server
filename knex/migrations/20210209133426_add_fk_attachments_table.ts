import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.table('attachments', tbl => {
    tbl.integer('message_id').references('messages.id').onDelete('CASCADE').onUpdate('CASCADE');
  })
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.table('attachments', tbl => {
    tbl.dropForeign(["message_id"]);
    tbl.dropColumn('message_id');
  });
}

