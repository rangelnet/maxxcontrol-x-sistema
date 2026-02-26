const express = require('express');
const router = express.Router();
const bugsController = require('./bugsController');
const authMiddleware = require('../../middlewares/auth');

router.post('/', authMiddleware, bugsController.reportBug);
router.get('/', authMiddleware, bugsController.getBugs);
router.post('/resolve', authMiddleware, bugsController.resolveBug);

module.exports = router;
