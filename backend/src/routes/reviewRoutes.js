const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const auth = require("../middlewares/authMiddleware");
const { checkRole } = require("../middlewares/roleAuthMiddleware");
const ROLES = require("../constants/roles");

// Yorum oluştur (sadece işveren)
router.post(
  "/projects/:projectId/reviews",
  auth.verifyAccessToken,
  checkRole(ROLES.EMPLOYER),
  reviewController.createReview
);

// Yorum güncelle (sadece yorum sahibi işveren)
// router.put(
//   "/reviews/:reviewId",
//   auth.verifyAccessToken,
//   checkRole(ROLES.EMPLOYER),
//   reviewController.updateReview
// );

// Yorum sil (sadece yorum sahibi işveren)
router.delete(
  "/reviews/:reviewId",
  auth.verifyAccessToken,
  checkRole(ROLES.EMPLOYER),
  reviewController.deleteReview
);

// Freelancer yorumları görüntüleme (herkes görebilir)
router.get(
  "/freelancers/:freelancerId/reviews",
  auth.verifyAccessToken,
  reviewController.getFreelancerReviews
);

// Kullanıcının yaptığı yorumları getir (sadece işveren)
router.get(
  "/reviews/my-reviews",
  auth.verifyAccessToken,
  checkRole(ROLES.EMPLOYER),
  reviewController.getMyReviews
);

// Review güncelleme (yeni endpoint - ID ile)
router.put(
  "/reviews/:id",
  auth.verifyAccessToken,
  checkRole(ROLES.EMPLOYER),
  reviewController.updateReview
);

module.exports = router;
