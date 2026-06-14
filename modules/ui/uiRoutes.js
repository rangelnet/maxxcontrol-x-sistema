const express = require('express');
const router = express.Router();
const uiController = require('./uiController');

// Home UI
router.get('/home', uiController.getHomeConfig);
router.post('/home', uiController.updateHomeConfig);

// VOD UI
router.get('/vod', uiController.getVodConfig);
router.post('/vod', uiController.updateVodConfig);

// Series UI
router.get('/series', uiController.getSeriesConfig);
router.post('/series', uiController.updateSeriesConfig);

module.exports = router;
