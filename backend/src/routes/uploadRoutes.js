const express = require("express");
const router = express.Router();
const upload = require("../middlewares/uploadMiddleware");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  uploadPortfolio,
  uploadProject,
  deletePortfolioFile,
  deleteProjectFile,
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
router.delete(
  "/portfolio/:fileName",
  authMiddleware.verifyAccessToken,
  deletePortfolioFile
);

router.delete(
  "/project/:projectId/:fileName", //
  authMiddleware.verifyAccessToken,
  deleteProjectFile
);
module.exports = router;
