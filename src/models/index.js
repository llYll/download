'use strict';

const config = require('../../config/config').mysql;
const Sequelize = require('sequelize');

if (config.orm.logging) {
    config.orm.logging = (sql) => {
        console.log('sql:', sql);
    };
}

const pool = new Sequelize(config.database, config.user, config.password, config.orm);

pool.authenticate()
    .then(() => {
        console.info('DB Connection has been established successfully');
    })
    .catch( err => {
        console.error('Unable to connect to the database', err);
    });

module.exports = {
    pool,
    Sequelize,
};
