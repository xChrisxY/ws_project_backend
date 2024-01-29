const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/login', userController.login);
router.post('/create', userController.createUser);
router.get('/users/:id', userController.getUsers)     
router.get('/user/:id', userController.getUserById)
router.get('/api/users/check-connections', userController.reviewNewConnections)
router.delete('/api/users/check-connections/:id', userController.removeConnections)

module.exports = router;
