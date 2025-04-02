const express = require('express');
const router = express.Router();
const RFIDController = require('../controllers/rfidController');

const rfidController = new RFIDController();

router.get('/', rfidController.handleRFIDRequest.bind(rfidController));
router.get('/users', rfidController.getAllUsers.bind(rfidController));
router.post('/users', rfidController.createUser.bind(rfidController));
router.delete('/users/:uid', rfidController.deleteUser.bind(rfidController));
router.patch('/users/:uid', rfidController.updateUser.bind(rfidController));

module.exports = router;