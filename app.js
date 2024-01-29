const WebSocket = require('ws');
const express = require('express');
const http = require('http');
const cors = require('cors');

const app = express();

const server = http.createServer(app)
const wss = new WebSocket.Server({ server });

const userRoutes = require('../src/routes/user');
const messageRoutes = require('../src/routes/messages');

// función para guardar los mensajes
const messageController = require('../src/controllers/messagesController');
//const userController = require('../src/controllers/userController');
const userController = require('../src/controllers/userController')

// Configuración para interactuar con la base de datos

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

app.use(express.json());
app.use(cors());



app.use('/', userRoutes);
app.use('/api/messages', messageRoutes);

//const usuariosConectados = new Set();

wss.on('connection', socket => {

      console.log('Cliente conectado');

      // Manejando los mensajes del cliente
      socket.on('message', async message => {

            try {

                  const mensaje = JSON.parse(message);

                  //chat.push(mensaje);  
                  if ( Object.keys(mensaje).length > 2 ) {

                        await messageController.saveMessage(mensaje.authorId, mensaje.recipientId, mensaje.message, mensaje.date, mensaje.hour)

                        wss.clients.forEach(client => {

                              if (client.readyState === WebSocket.OPEN) {

                                    client.send(`${message}`);

                              }

                        });

                  } else {

                        console.log(mensaje);

                        // Enviar a todos los clientes que se ha conectado dicho cliente
                        if (mensaje.type === 'userConnected') {

                              if (!userController.usuariosConectados.has(parseInt(mensaje.id))) {

                                    console.log('Agregando el número en la lista');
                                    
                                    userController.usuariosConectados.add(parseInt(mensaje.id))

                              }
                              
                              // wss.clients.forEach(cliente => {
      
                              //       if (cliente !== wss && cliente.readyState === WebSocket.OPEN){
      
                              //             cliente.send(JSON.stringify({type: 'new connection', message : `${mensaje.id}`}));
      
                              //       }
      
                              // })

                        } 

                  }

            } catch (error) {

                  console.error('Error al parsear el mensaje JSON: ', error);
            }

      });

      socket.on('close', () => {

            console.log('Cliente desconectado');

      });

});

server.listen(3000, () => {
      console.log('Server on port 3000')
})
