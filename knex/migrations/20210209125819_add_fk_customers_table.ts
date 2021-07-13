import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.table('customers',  tbl => {
    tbl.integer('user_id').references('users.id').onDelete('CASCADE').onUpdate('CASCADE');
  });
  
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.table('customers', tbl => {
    tbl.dropForeign(["user_id"]);
    tbl.dropColumn('user_id')
  })
}

