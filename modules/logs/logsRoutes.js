const express = require('express');
const router = express.Router();
const logsController = require('./logsController');
const authMiddleware = require('../../middlewares/auth');

router.post('/', authMiddleware, logsController.createLog);
router.get('/', authMiddleware, logsController.getLogs);

module.exports = router;
