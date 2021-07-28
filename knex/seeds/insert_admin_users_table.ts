import * as Knex from "knex";

export async function seed(knex: Knex): Promise<void> {
    // Inserts seed entries
    await knex("users").insert([
        { 
          email: 'hamisha@gmail.com',
          role: 'admin',
          first_name: "Hamisha",
          phone_number: '254716271297',
          password: `$2y$10$iyifR/PLoLg92j6UnXn1X.1h0L6j4PiaeoZRq8yRDJW7a2ItilM2y`
        },
    ]);
};
