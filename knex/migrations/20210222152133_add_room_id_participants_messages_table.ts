import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.table('messages', tbl => {
    tbl.integer('room_id').references('rooms.id').onDelete('CASCADE').onUpdate('CASCADE');
  });
  await knex.schema.table('participants', tbl => {
    tbl.integer('room_id').references('rooms.id').onDelete('CASCADE').onUpdate('CASCADE');
  });
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.table('messages', tbl => {
    tbl.dropColumn('room_id')
  })
  await knex.schema.table('participants', tbl => {
    tbl.dropColumn('room_id')
  })
}

