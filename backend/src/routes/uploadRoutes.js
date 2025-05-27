const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const { upload, uploadProfileImage } = require("../middlewares/uploadMiddleware");
const authMiddleware = require("../middlewares/authMiddleware");
const {
  uploadPortfolio,
  uploadProject,
  deletePortfolioFile,
  deleteProjectFile,
  uploadProfileImage: uploadProfileImageController,
  deleteProfileImage,
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

// Profil fotoğrafı yükleme
router.post(
  "/profile-image",
  authMiddleware.verifyAccessToken,
  uploadProfileImage.single("image"),
  uploadProfileImageController
);

// Profil fotoğrafı silme
router.delete(
  "/profile-image",
  authMiddleware.verifyAccessToken,
  deleteProfileImage
);

// Profil fotoğrafı görüntüleme (CORS sorunu için alternatif)
router.get("/image/:filename", (req, res) => {
  const { filename } = req.params;
  const imagePath = path.join(__dirname, "../../images", filename);

  // CORS headers ekle
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Cross-Origin-Resource-Policy', 'cross-origin');

  // Dosya var mı kontrol et
  if (fs.existsSync(imagePath)) {
    res.sendFile(imagePath);
  } else {
    res.status(404).json({ message: "Dosya bulunamadı" });
  }
});

module.exports = router;
