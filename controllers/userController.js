const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
const bycript = require('bcrypt');
require('dotenv').config();

const SECRET_KEY = process.env.SECRET_KEY
const saltRounds = parseInt(process.env.SALT_ROUNDS_BCRYPT);

const login = async (req, res) => {

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

module.exports = {
      login,
      createUser,
      getUsers
}