const express = require('express');
const router = express.Router();
const apiConfigController = require('./apiConfigController');
const authMiddleware = require('../../middlewares/auth');

router.get('/', authMiddleware, apiConfigController.listAPIs);
router.post('/', authMiddleware, apiConfigController.createAPI);
router.put('/:id', authMiddleware, apiConfigController.updateAPI);
router.delete('/:id', authMiddleware, apiConfigController.deleteAPI);
router.get('/:id/history', authMiddleware, apiConfigController.getAPIHistory);
router.get('/categories/list', authMiddleware, apiConfigController.getCategories);

module.exports = router;
