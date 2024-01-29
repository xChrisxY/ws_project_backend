const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

let clientesAresponder = [];

const responderCliente = notificacion => {

      console.log('vamos a responder a los clientes')

      for (res of clientesAresponder) {

            res.status(200).json({

                  success: true,
                  notificacion

            })

      };

      clientesAresponder = [];

}

const saveMessage = async (authorId, recipientId, message, date, hour) => {

      try {

            const newMessage = await prisma.message.create({

                  data: {

                        message,
                        date,
                        hour,
                        authorId,
                        recipientId

                  }

            });

            const notificacion = { authorId, message, recipientId }

            responderCliente(notificacion);

            // if (!newMessage) {

            //      return res.status(401).json({
            //             success: false,
            //             message : 'El mensaje no se guardó correctamente',
            //      })

            // }

            // return res.status(200).json({
            //       success : true,
            //       message : 'Mensaje guardado correctamente',
            //       data : newMessage
            // })

      } catch (error) {

            console.error(error);
            // return res.status(400).json({
            //       success: false,
            //       message: 'Internal Server Error'
            // });

      }

}

const getChat = async (req, res) => {

      try {

            const { userId, contactId } = req.params;
            const messages = await prisma.message.findMany({

                  where: {

                        OR: [

                              { authorId: parseInt(userId), recipientId: parseInt(contactId) },
                              { authorId: parseInt(contactId), recipientId: parseInt(userId) }

                        ]

                  }, orderBy: {

                        id: 'asc'

                  }

            });

            if (messages.length > 0) {

                  return res.status(200).json({
                        success: true,
                        messages
                  });

            }

            return res.status(200).json({
                  success: false,
                  message: 'messages not found'
            })

      } catch (error) {

            console.error(error);
            return res.status(400).json({
                  success: false,
                  message: 'Internal Server Error'
            });
      }

}

const notifyUsers = (req, res) => {
      
      if (!clientesAresponder.includes(res)) {

            console.log('vamos a agregar un cliente');

            clientesAresponder.push(res);
            
      }

}

module.exports = {

      saveMessage,
      getChat,
      notifyUsers
}