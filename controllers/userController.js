const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
const bycript = require('bcrypt');
require('dotenv').config();

const SECRET_KEY = process.env.SECRET_KEY
const saltRounds = parseInt(process.env.SALT_ROUNDS_BCRYPT);

const usuariosConectados = new Set();

// let lastUserCreated = 0;

// const lastUserCreatedFuncion = async () => {

//       const users = await prisma.user.findMany();

//       lastUserCreated = users[users.length - 1].id;

// }

const login = async (req, res) => {

      console.log(req.body);

      try {

            const { username, password } = req.body;

            const user = await prisma.user.findFirst({

                  where: {
                        username: username
                  }
            })

            if (!user) {

                  return res.status(401).json({
                        success: false,
                        message: 'Usuario o contraseña incorrecta'
                  });

            }

            const isCorrectPass = bycript.compareSync(password, user.password);

            if (!isCorrectPass) {

                  return res.status(401).json({
                        success: false,
                        message: 'Usuario o contraseña incorrecta'
                  })

            }

            const payload = {

                  user: {
                        id: user.id
                  }

            }

            const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' });

            res.status(200).json({
                  success: true,
                  message: 'user loggin succesfully',
                  userId : user.id, 
                  token: token
            });

      } catch (error) {

            console.error(error);

            res.status(400).json({
                  success: false,
                  message: 'user didnot loggin succesfully',
                  token: token
            });
      }

}

const createUser = async (req, res) => {

      try {

            const { username, password } = req.body;

            const encryptedPasword = bycript.hashSync(password, saltRounds)

            const newUser = await prisma.user.create({

                  data: {
                        username: username,
                        password: encryptedPasword
                  }
            })

            // obtenemos esta variable para el long polling
            lastUserCreated = newUser.id;

            const token = jwt.sign({ userId: newUser.id }, SECRET_KEY, { expiresIn: '1h' })

            return res.status(200).json({
                  success: true,
                  message: 'user created successfully',
                  userId : newUser.id,
                  token: token
            })


      } catch (error) {

            console.error(error);
            return res.status(400).json({
                  success: false,
                  message: 'User didnt created successfully'
            })

      }

}

const getUsers = async (req, res) => {

      try {

            const { id } = req.params;
            
            console.log(id)

            const users = await prisma.user.findMany();
            const filterUsers = users.filter(user => user.id !== parseInt(id));

            res.status(200).json({
                  success : true,
                  users : filterUsers     
            })

      } catch (error) {

            console.error(error);
            res.status(200).json({
                  success : false,
                  message : 'Ha ocurrido un error'
            });

      }

}

const getUserById = async (req, res) => {

      try {
            
            const { id } = req.params;

            const user = await prisma.user.findFirst({

                  where : {

                        id : parseInt(id)

                  }
            });

            console.log(user);

            if (!user) {

                  return res.status(401).json({
                        success : false,
                        message : 'User not found'
                  });

            } 

            return res.status(200).json({
                  success : true,
                  message : 'User found',
                  user : {
                        id : user.id,
                        username : user.username
                  }
            })

      } catch (error) {

            console.error(error);
            res.status(200).json({
                  success : false,
                  message : 'Ha ocurrido un error'
            });

      }

}

const reviewNewConnections = (req, res) => {

      const usuarios = Array.from(usuariosConectados)

      res.status(200).json({
            success : true,
            usuariosConectados : usuarios
      })

}

const removeConnections = (req, res) => {

      try {
            
            const { id } = req.params;

            console.log('Cliente desconectandose...');

            if (usuariosConectados.has(parseInt(id))) {

                  usuariosConectados.delete(parseInt(id));

                  const usuarios = Array.from(usuariosConectados)

                  return res.status(200).json({

                        success : true,
                        usuarios

                  })

            }

            return res.status(200).json({

                  success : true,
                  message : 'User not found'

            });

      } catch (error) {

            console.error("Ha ocurrido un error grave");
            console.log(error);
            
      }

}

// const notifyUsers = async (req, res) => {

//       try {
            


//       } catch (error) {
            
//             console.error(error);

//       }

// }

module.exports = {
      login,
      createUser,
      getUsers,
      getUserById,
      reviewNewConnections,
      usuariosConectados,
      removeConnections
}