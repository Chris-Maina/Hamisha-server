import * as Knex from "knex";

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex("payment_types").del();
    await knex.raw("ALTER SEQUENCE payment_types_id_seq RESTART WITH 1")

    // Inserts seed entries
    await knex("payment_types").insert([
        { id: 1, name: "per hour" },
        { id: 2, name: "fixed price" }
    ]);
};
