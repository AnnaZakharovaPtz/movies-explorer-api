require('dotenv').config();

const {
  NODE_ENV,
  JWT_SECRET,
  PORT,
  DB_URL,
} = process.env;

const DEV_PORT = 3001;
const DEV_DB_URL = 'mongodb://127.0.0.1:27017/bitfilmsdb';
const DEV_SECRET = 'some-secret-string-for-jwt';

const DB = NODE_ENV === 'production' && DB_URL ? DB_URL : DEV_DB_URL;
const SERVER_PORT = NODE_ENV === 'production' && PORT ? PORT : DEV_PORT;
const SERVER_SECRET = NODE_ENV === 'production' && JWT_SECRET ? JWT_SECRET : DEV_SECRET;

const SALT_ROUNDS = 10;

module.exports = {
  DB,
  SERVER_PORT,
  SERVER_SECRET,
  SALT_ROUNDS,
};
