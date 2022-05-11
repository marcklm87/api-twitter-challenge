const  { Router } = require('express');
const router = Router();
require('dotenv').config()
const {verifyToken, verifyTokenAdmin } = require('../main')
const db =  require('../../db')
var moment = require('moment');
var jwt = require('jsonwebtoken');

router.put('/lend-book', verifyTokenAdmin, async (req, res) => {
    let error =""
    let statusCode = 200
    let data ={}
    try {
        const existdata = await db.sequelize.query(`select 
            bhu.id 
        from 
            book_has_user bhu 
        where bhu.book_id =${req.body.book}
        and bhu.borrow 
        `, 
        { type: db.sequelize.QueryTypes.SELECT});
        if(existdata.length == 0){
            const bookBorrow = {
                'book_id':req.body.book,
                'user_id':req.body.user,
                'borrow': 1,
                'date_borrow': moment()
            }
            console.log('bookBorrow', bookBorrow)
            await db.book_has_user.create(bookBorrow)
        }else {
            statusCode= 400
            error = 'No se puede registrar el libro ya se encuentra prestado.'
        }
        res.status(statusCode).send({
            error,
            message:"Operación completada exitosamente."
        }); 
    } catch (error) {
        statusCode= 500
        res.status(statusCode).send({
            error,
            message:"Intente nuevamente operación no completada"
        });
    }
});

router.put('/borrow-book', verifyToken, async (req, res) => {
    let error =""
    let statusCode = 200
    let data ={}
    let userId= null
    try {
        const bearerHeader =  req.headers['authorization'];
        console.log('bearerHeader', bearerHeader)
        try {
            if(typeof bearerHeader !== 'undefined'){
                console.log('entramos')
                const bearerToken = bearerHeader.split(" ")[1];
                req.token  = bearerToken;
                const user = jwt.verify(bearerToken, process.env.PRIVATE_KEY_JWT);
                console.log('user', user)
                userId = user.id
            }
        }
        catch(eb) {
            statusCode=400
            error='No obtenemos el id de usuario'
        }
            
        const existdata = await db.sequelize.query(`select 
            bhu.id 
        from 
            book_has_user bhu 
        where bhu.book_id =${req.body.book}
        and bhu.borrow 
        `, 
        { type: db.sequelize.QueryTypes.SELECT});
        if(existdata.length == 0){
            const bookBorrow = {
                'book_id':req.body.book,
                'user_id':userId,
                'borrow': 1,
                'date_borrow': moment()
            }
            console.log('bookBorrow', bookBorrow)
            await db.book_has_user.create(bookBorrow)
        }else {
            statusCode= 400
            error = 'No se puede registrar el libro ya se encuentra prestado.'
        }
        res.status(statusCode).send({
            error,
            message:"Operación completada exitosamente."
        }); 
    } catch (error) {
        statusCode= 500
        res.status(statusCode).send({
            error,
            message:"Intente nuevamente operación no completada"
        });
    }
});

router.get('/book-list', verifyToken, async (req, res) => {
    let error =""
    let statusCode = 200
    let data ={}
    try {
        const filter = req.query.category == 0 ? `` : ` and b.category_id = ${req.query.category} `
        data = await db.sequelize.query(`SELECT 
        b.id, 
        b.title,
        b.author,
        b.image_code,
        b.category_id,
        if(bhu.book_id is not null, 1, 0) as borrow,
        c.name as category,
        CONCAT(ifnull(u.name,''),' ', ifnull(u.lastname,'')) as usuario,
        b.image_code, 
        b.year_publication
    from book b 
    inner join category c ON c.id = b.category_id 
    left join book_has_user bhu 
    on 	bhu.book_id = b.id and bhu.borrow 
    left join user u on u.id = bhu.user_id 
    where 1=1 ${filter}
    order by b.created_at desc 
     `, 
    { type: db.sequelize.QueryTypes.SELECT});
    res.status(statusCode).send( {
        message: 'Transacción completada satisfactoriamente.',
        count: data.length,
        data,
        error
    });
    } catch (error) {
        statusCode= 500
        res.status(statusCode).send({
            error,
            message:"Intente nuevamente operación no completada"
        });
    }
});

router.put('/add-book', verifyTokenAdmin, async (req, res) => {
    let error =""
    let statusCode = 200
    let data ={}
    let transaction =await db.sequelize.transaction();
    try {
        console.log('insertando libro')
        const book = {
            image_code : req.body.cover_image,
            cover_image : "",
            title: req.body.title,
            year_publication: req.body.year,
            author: req.body.author,
            category_id: req.body.category
        }
        const newBook = (await db.book.create(book, {transaction})).get({ plain: true });
        console.log('new book id', newBook.id )
        try {
            /*
            var base64Data = req.body.cover_image.replace(/^data:image\/png;base64,/, "");
            require("fs").writeFile(`src/images/${newBook.id}.png`, base64Data, 'base64', function(err) {
                if(err != null){
                    console.log('error insertando archivo', err);
                    statusCode = 400
                    error="No se pudo cargar la imagen"
                }
            });
            */
            // await db.book.update({cover_image: newBook.id+'.png'}, { where: { id: newBook.id }, transaction})
        } catch (er) {
            statusCode= 400
            error = er
            if (transaction) await transaction.rollback();
        }
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
            message:"Intente nuevamente operación no completada"
        });
    }
});

router.put('/edit-book/:id', verifyTokenAdmin, async (req, res) => {
    let error =""
    let statusCode = 200
    let data ={}
    let transaction =await db.sequelize.transaction();
    try {
        console.log('UPDATE libro')
        const book = {
            image_code : req.body.cover_image,
            title: req.body.title,
            year: req.body.year,
            author: req.body.author,
            category_id: req.body.category
        }
        try {
            var base64Data = req.body.cover_image.replace(/^data:image\/png;base64,/, "");
            require("fs").writeFile(`src/images/${req.params.id}.png`, base64Data, 'base64', function(err) {
                if(err != null){
                    console.log('error insertando archivo', err);
                    statusCode = 400
                    error="No se pudo cargar la imagen"
                }
            });
            if(statusCode == 200) await db.book.update(book, { where: { id: req.params.id }, transaction})
        } catch (er) {
            statusCode= 400
            error = er
            if (transaction) await transaction.rollback();
        }
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
            message:"Intente nuevamente operación no completada"
        });
    }
});

router.delete('/delete-book/:id', verifyTokenAdmin, async (req, res) => {
    let error =""
    let statusCode = 200
    let data ={}
    let transaction =await db.sequelize.transaction();
    try {
        console.log('delete libro')
        try {
            if(require("fs").existsSync(`src/images/${req.params.id}.png`)) require("fs").unlinkSync(`src/images/${req.params.id}.png`);
            await db.book.destroy({ where: { id: req.params.id }, transaction})
        } catch (er) {
            console.log('error delete book', er)
            statusCode= 400
            error = er
            if (transaction) await transaction.rollback();
        }
        await transaction.commit();
        res.status(statusCode).send( {
            message: 'Transacción completada satisfactoriamente.',
            data: "",
            error
        });
    } catch (errorr) {
        console.log('error delete', errorr)
        if (transaction) await transaction.rollback();
        statusCode= 500
        res.status(statusCode).send({
            error:errorr,
            message:"Intente nuevamente operación no completada"
        });
    }
});
module.exports = router;
