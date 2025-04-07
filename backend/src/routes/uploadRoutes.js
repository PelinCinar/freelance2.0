const express = require("express");
const router = express.Router();
const upload = require("../middlewares/uploadMiddleware");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  uploadPortfolio,
  uploadProject,
} = require("../controllers/uploadController");

// Kullanıcıya ait portfolyo yükleme (örnek: /api/upload/portfolio/:userId)
router.post(
  "/portfolio",
  authMiddleware.verifyAccessToken,
  upload.single("file"),
  uploadPortfolio
);
router.post(
  "/project/:projectId",
  authMiddleware.verifyAccessToken,
  upload.single("file"),
  uploadProject
);

module.exports = router;
