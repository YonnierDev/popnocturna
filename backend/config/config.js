require('dotenv').config();

module.exports = {
  development: {
    username: "root",
    password: "RUMTYuCcnbhsFBNmWrrTqETiGJIgsjUQ",
    database: "railway",
    host: "turntable.proxy.rlwy.net",
    port: 45692,
    dialect: "mysql",
    dialectModule: require('mysql2'),
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  },
  test: {
    username: "root",
    password: "RUMTYuCcnbhsFBNmWrrTqETiGJIgsjUQ",
    database: "railway",
    host: "turntable.proxy.rlwy.net",
    port: 45692,
    dialect: "mysql",
    dialectModule: require('mysql2'),
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  },
  production: {
    username: "root",
    password: "RUMTYuCcnbhsFBNmWrrTqETiGJIgsjUQ",
    database: "railway",
    host: "turntable.proxy.rlwy.net",
    port: 45692,
    dialect: "mysql",
    dialectModule: require('mysql2'),
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
};