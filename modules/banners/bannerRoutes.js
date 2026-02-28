const express = require('express');
const router = express.Router();
const controller = require('./bannerController');

router.get('/list', controller.listBanners);
router.get('/:id', controller.getBanner);
router.post('/create', controller.createBanner);
router.put('/:id', controller.updateBanner);
router.delete('/:id', controller.deleteBanner);
router.post('/generate', controller.generateBanner);

module.exports = router;
