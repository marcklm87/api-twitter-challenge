const  { Router } = require('express');
var jwt = require('jsonwebtoken');
const router = Router();
const db =  require('../../db')
require('dotenv').config()
const {verifyToken, verifyTokenAdmin} = require('../main')

router.get('/catalog/category', verifyToken, async (req, res) => {
    let error =""
    let message = 'Transacción completada satisfactoriamente!'
    let statusCode = 200
    let data =[]
    try {
        data = await db.sequelize.query(`select c.id, c.name from category c order by c.name` , { type: db.sequelize.QueryTypes.SELECT});
        res.status(statusCode).send({
            message,
            error,
            count: data.length,
            data
        });
    } catch (error) {
        statusCode= 500
        res.status(statusCode).send({
            error,
            message
        });
    }
});

router.get('/catalog/users', verifyTokenAdmin, async (req, res) => {
    let error =""
    let message = 'Transacción completada satisfactoriamente!'
    let statusCode = 200
    let data =[]
    try {
        data = await db.sequelize.query(`select u.id, CONCAT(u.name, ' ', u.lastname) as userName from user u order by u.name asc` , { type: db.sequelize.QueryTypes.SELECT});
        res.status(statusCode).send({
            message,
            error,
            count: data.length,
            data
        });
    } catch (error) {
        statusCode= 500
        res.status(statusCode).send({
            error,
            message
        });
    }
});


module.exports = router;
