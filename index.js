const express = require('express');
const http = require('http');
const socketio = require('socket.io')
const cors = require('cors')
const bodyParser = require('body-parser');
const {streamConnect} = require('./src/usecase/index')
require('dotenv').config()

const corsOptions = { 
    origin: ['http://localhost:3000','http://localhost:3000/'],
    credentials: false
  }
  
const app = express();
app.use(cors())
app.use(bodyParser.json({limit: '25mb'}));
app.use(bodyParser.urlencoded({extended:true}))
app.use(require('./src/routes/index'))


const servidor = http.createServer(app);
const io = socketio(servidor, {
    cors: {
        origin: "*"
    },
});

io.on('connection', async (socket) => {
    try {
        console.log("Cliente Conectado!");
        await streamConnect(0, socket )
        socket.on('disconnect', () => { 
            console.log("Cliente Desconectado");
        });
    } catch (error) {
        console.log('error en server=>', error)
    }
    
});

servidor.listen(process.env.PORT, () => console.log(`El servidor está corriendo en http://localhost:${process.env.PORT}`));
