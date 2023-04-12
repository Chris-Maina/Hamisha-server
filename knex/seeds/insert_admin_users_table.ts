import * as Knex from "knex";

export async function seed(knex: Knex): Promise<void> {
    // Inserts seed entries
    await knex("users").insert([
        { 
          email: 'chris.maina@bebataka.co.ke',
          role: 'admin',
          first_name: "Chris",
          last_name: "Maina",
          phone_number: '254716271297',
          password: `$2y$10$iyifR/PLoLg92j6UnXn1X.1h0L6j4PiaeoZRq8yRDJW7a2ItilM2y`
        },
    ]);
};
