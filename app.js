const WebSocket = require('ws');
const express = require('express');
const http = require('http');
const cors = require('cors');

const app = express();

const server = http.createServer(app)
const wss = new WebSocket.Server({server});

const userRoutes = require('../src/routes/user');

// Configuración para interactuar con la base de datos

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

app.use(express.json());
app.use(cors());
      
app.use('/', userRoutes);

let chat = [];

wss.on('connection', socket => {

      console.log('Cliente conectado');

      // Manejando los mensajes del cliente
      socket.on('message', message => {

            try {

                  const mensaje = JSON.parse(message);
                  chat.push(mensaje);     

                  wss.clients.forEach(client => {

                        if (client.readyState === WebSocket.OPEN) {
      
                              client.send(`${message}`);
      
                        }
      
                  });

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