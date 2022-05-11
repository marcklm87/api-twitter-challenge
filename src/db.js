const Sequelize = require('sequelize')
const initModels = require('./models/init-models')
require('dotenv').config()

var db = {}

const sequelize = new Sequelize(process.env.NAME_DATABASE, process.env.USER_DATABASE , process.env.PASSWORD_DATABASE, {
    host: process.env.DATABASE_URL,
    port: '3306',
    dialect: 'mysql',
    define: {
        freezeTableName: true,
    },
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
    // http://docs.sequelizejs.com/manual/tutorial/querying.html#operators
    operatorsAliases: 0,
    // timezone: 'UTC'
    //charset: 'utf8',
    //collate: 'utf8_general_ci',
})

db = { ...initModels(sequelize) }
db.sequelize = sequelize
db.Sequelize = Sequelize
module.exports = db