require("dotenv").config();
module.exports = {
  development: {
    username: process.env.pg_username,
    password: process.env.pg_password,
    database: process.env.pg_database_dev,
    host: "127.0.0.1",
    dialect: "postgres",
    logging: console.log
  },
  test: {
    username: process.env.pg_username,
    password: process.env.pg_password,
    database: "database_test",
    host: "127.0.0.1",
    dialect: "postgres",
    operatorsAliases: false
  },
  production: {
    username: "root",
    password: null,
    database: "database_production",
    host: "127.0.0.1",
    dialect: "postgres",
    operatorsAliases: false
  }
};
