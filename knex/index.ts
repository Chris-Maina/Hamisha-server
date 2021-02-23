import Knex from 'knex';
import knexConfig from '../knexfile';

// Initialize knex
const env = process.env.NODE_ENV || 'development';
const config = knexConfig[env];
const knex = Knex(config);
export default knex;
