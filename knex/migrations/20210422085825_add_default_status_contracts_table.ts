import * as Knex from "knex";
import { CONTRACT_STATUS } from "../../common/constants";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("contracts", tbl => {
    tbl.string("status").notNullable().defaultTo(CONTRACT_STATUS.DRAFT).alter()
  });
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("contracts", tbl => {
    tbl.string("status").nullable().alter();
  });
}
