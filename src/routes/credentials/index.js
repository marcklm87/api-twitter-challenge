const  { Router } = require('express');
const router = Router();
const db =  require('../../db')
const catalog_rol = require('../../constant/catalog_rol')
require('dotenv').config()
var jwt = require('jsonwebtoken');

router.post('/login', async (req, res) => {
    const privateKey = process.env.PRIVATE_KEY_JWT
    let data =[]
    
    try {
        data = await db.sequelize.query(`select 
        u.id,
        u.name,
        u.lastname,
        if(u.rol_id = 1, 1, 0) as isadmin
    from 
        user u 
    where 
        u.email ='${req.body.email}' 
        and u.password ='${req.body.password}'
        and u.active `, { type: db.sequelize.QueryTypes.SELECT});
        if(data.length == 0) return res.status(400).send({error: 'Credenciales incorrectas.' }); 
        data[0].expiresIn = '2'
        // data[0].iat = '2000'
        jwt.sign( data[0], privateKey, function(err, token) {
            console.log(token)
            res.json({
                token,
                message: "Transacción completada satisfactoriamente.",
                isadmin: data[0].isadmin,
                name : data[0].name
            })
        });
       
    } catch (error) {
        console.log('error=>', error)
        res.status(400).send({
            error,
            message:"Intente más tarde! Tenemos problemas para resolver la petición"
        });
    }
    
});


router.get('/', async (req, res) => {
    res.status(200).send({
        message: 'Bienvenido API Library V1'
    });
});

router.put('/add-user', async (req, res) => {
    let error =""
    let statusCode = 200
    let data ={}
    let transaction =await db.sequelize.transaction();
    try {
        console.log('insertando usuario')
        const user = {
            name : req.body.name,
            lastname: req.body.lastname,
            email: req.body.email,
            password: req.body.password,
            rol_id: catalog_rol.user,
            active:1
        }
        const newUser = (await db.user.create(user, {transaction})).get({ plain: true });
        console.log('new book id', newUser.id )
        await transaction.commit();
        res.status(statusCode).send( {
            message: 'Transacción completada satisfactoriamente.',
            data: "",
            error
        });
    } catch (error) {
        if (transaction) await transaction.rollback();
        statusCode= 500
        res.status(statusCode).send({
            error,
            message:"Intente nuevamente operación no completada."
        });
    }
});



module.exports = router;
