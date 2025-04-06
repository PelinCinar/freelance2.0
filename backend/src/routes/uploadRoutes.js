const express = require("express");
const router = express.Router();
const upload = require("../middlewares/uploadMiddleware");
const authMiddleware = require("../middlewares/authMiddleware");
const { uploadPortfolio } = require("../controllers/uploadController");

// Kullanıcıya ait portfolyo yükleme (örnek: /api/upload/portfolio/:userId)
router.post("/portfolio/:userId",authMiddleware.verifyAccessToken,upload.single("file"),uploadPortfolio);

module.exports = router;
