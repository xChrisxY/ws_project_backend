const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/login', userController.login);
router.post('/create', userController.createUser);
router.get('/users/:id', userController.getUsers)     

module.exports = router;
