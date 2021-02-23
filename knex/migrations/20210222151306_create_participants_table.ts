import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('participants', tbl => {
    tbl.increments();
    tbl.integer('user_id').references('users.id').onDelete('CASCADE').onUpdate('CASCADE');
  });
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('participants');
}

