const express = require('express');
const { trimVideo, addTextOverlay, applyFilter } = require('../controllers/video.controller');

const router = express.Router();

// Video editing routes
router.post('/trim', trimVideo);
router.post('/text-overlay', addTextOverlay);
router.post('/filter', applyFilter);

module.exports = router;
