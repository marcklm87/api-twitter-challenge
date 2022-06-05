const  { Router } = require('express');
const router = Router();
const catalog_rol = require('../../constant/catalog_rol')
require('dotenv').config()
var jwt = require('jsonwebtoken');

router.post('/login', async (req, res) => {
    const privateKey = process.env.PRIVATE_KEY_JWT
    let data =[]
    
    try {
        data = {
            name:"Marco",
            email:"mmarcoantoniolopez@gmail.com",
            expiresIn : '2'
        }
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
        message: 'Bienvenido API Twitter Challenge V2'
    });
});


module.exports = router;
