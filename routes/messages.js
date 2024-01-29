const express = require('express');
const router = express.Router()
const messageController = require('../controllers/messagesController')

router.get('/:userId/:contactId', messageController.getChat);
router.get('/notification', messageController.notifyUsers)  

module.exports = router;