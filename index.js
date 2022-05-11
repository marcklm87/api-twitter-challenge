const express = require('express');
const bodyParser = require('body-parser');
var cors = require('cors')
require('dotenv').config()
// merge test 
// test 1,2

const app = express();
app.use(cors())
app.use(bodyParser.json({limit: '25mb'}));
app.use(bodyParser.urlencoded({extended:true}))

// routes 
app.use(require('./src/routes/index'))
app.listen(process.env.PORT, ()=>{
    console.log(`El servidor está corriendo en http://localhost:${process.env.PORT}`)
})