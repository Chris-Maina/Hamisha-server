import dotenv from 'dotenv';

// load env variables
dotenv.config();

// Update with your config settings.
interface KnexConfig {
  [key: string]: object;
};

const knexConfig: KnexConfig = {

  development: {
    client: "pg",
    connection: process.env.DATABASE_URL,
    migrations: {
      directory: './knex/migrations'
    },
    seeds: {
      directory: './knex/seeds'
    }
  },

  staging: {
    client: "postgresql",
    connection: {
      database: "my_db",
      user: "username",
      password: "password"
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: "knex_migrations"
    }
  },

  production: {
    client: "pg",
    connection: process.env.DATABASE_URL,
    // connection: {
    //   database: process.env.DATABASE_NAME,
    //   user: process.env.DATABASE_USER,
    //   password: process.env.DATABASE_PASSWORD,
    //   port: process.env.DATABASE_PORT,
    //   host: process.env.DATABASE_HOST,
    //   ssl: { rejectUnauthorized: false }
    // },
    migrations: {
      directory: "./knex/migrations"
    },
    seeds: {
      directory: './knex/seeds'
    }
  }

};
export default knexConfig;
