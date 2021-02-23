import { table } from "console";
import * as Knex from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('users', tbl => {
    tbl.increments();
    tbl.string('first_name');
    tbl.string('last_name');
    tbl.string('email');
    tbl.string('password');
  });
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('users');
}

