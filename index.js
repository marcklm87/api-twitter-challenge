const express = require('express');
var cors = require('cors')
require('dotenv').config()
// merge test 
// test 1,2

const app = express();
app.use(cors())


// routes 
app.use(require('./src/routes/index'))
app.listen(process.env.PORT, ()=>{
    console.log(`El servidor está corriendo en http://localhost:${process.env.PORT}`)
})