const  { Router } = require('express');
const router = Router();
require('dotenv').config()
var jwt = require('jsonwebtoken');
const { changeRules, getAllRules } = require('../../usecase/index')
router.post('/newstopics', async (req, res) => {
    // const privateKey = process.env.PRIVATE_KEY_JWT
    console.log('body', req.body)
    try {
        const filters = req.body.filters.split(',')
        await changeRules(filters)
        res.json({
            message: "Transacción completada satisfactoriamente.",
            filters
        })
    } catch (error) {
        console.log('error newstopics=>', error)
        res.status(400).send({
            error,
            message:"Intente más tarde! Tenemos problemas para resolver la petición"
        });
    }
    
});

router.get('/getFilters', async (req, res) => {
    // const privateKey = process.env.PRIVATE_KEY_JWT
    try {
        const filters = await getAllRules()
        let filtersValue = filters.data.map(element=>{
            return element.value
        })
        console.log('filtersValue', filtersValue.toString())
        res.json({
            message: "Transacción completada satisfactoriamente.",
            filters: filtersValue.toString()
        })
    } catch (error) {
        console.log('error getFilters=>', error)
        res.status(400).send({
            error,
            message:"Intente más tarde! Tenemos problemas para resolver la petición"
        });
    }
    
});


module.exports = router;
