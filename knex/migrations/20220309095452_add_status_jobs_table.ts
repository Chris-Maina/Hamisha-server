import * as Knex from "knex";
import { JOB_STATUS } from "../../common/interfaces";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.table("jobs", tbl => {
    tbl.string("status").notNullable().defaultTo(JOB_STATUS.ACTIVE);
  });
}


export async function down(knex: Knex): Promise<void> {
  return await knex.schema.table("jobs", tbl => {
    tbl.dropColumn("status");
  });
}
