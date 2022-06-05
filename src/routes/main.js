var jwt = require('jsonwebtoken');
const { token } = require('morgan');
require('dotenv').config()

function verifyToken(req, res, next){
    const bearerHeader =  req.headers['authorization'];
    try {
        if(typeof bearerHeader !== 'undefined'){
            const bearerToken = bearerHeader.split(" ")[1];
            req.token  = bearerToken;
            console.log('token', token)
            const user = jwt.verify(bearerToken, process.env.PRIVATE_KEY_JWT);
            //console.log('user', user)
            next();
        }else{
            res.status(403).send( {
                message: 'Unauthorized',
                sessionExpired: false,
                extra:'Imposible token invalido!'
            });
        }
    } catch (error) {
        res.status(403).send( {
            message: 'Unauthorized',
            sessionExpired: false,
            error
        });
    }
}


module.exports = {
    verifyToken
}