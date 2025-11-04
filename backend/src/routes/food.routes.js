const express = require('express');
const foodController = require("../controllers/food.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const router = express.Router();
const multer = require('multer');

// Configure multer for video uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Only video files are allowed'), false);
        }
    }
});

/* POST /api/food/ [protected] - Create food item */
router.post('/',
    authMiddleware.authFoodPartnerMiddleware,
    upload.single("video"),
    foodController.createFood);

/* GET /api/food/ [public] - Get all food items */
router.get("/",
    foodController.getFoodItems);

/* POST /api/food/like [protected] - Like/unlike food */
router.post('/like',
    authMiddleware.authUserMiddleware,
    foodController.likeFood);

/* POST /api/food/save [protected] - Save/unsave food */
router.post('/save',
    authMiddleware.authUserMiddleware,
    foodController.saveFood);

/* GET /api/food/save [protected] - Get saved foods */
router.get('/save',
    authMiddleware.authUserMiddleware,
    foodController.getSaveFood);

module.exports = router;
