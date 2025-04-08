const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middlewares/authMiddleware');
// const { checkRole } = require('../middlewares/roleAuthMiddleware');
// const ROLES = require('../constants/roles');

router.post(
  '/projects/:projectId/reviews',
  authMiddleware.verifyAccessToken,
  reviewController.createReview
);

router.get(
  '/projects/:projectId/reviews',
  authMiddleware.verifyAccessToken,
  reviewController.getProjectReviews
);

// Belirli bir kullanıcıya ait tüm yorumları listeleme
router.get(
  '/users/:userId/reviews',
  authMiddleware.verifyAccessToken,
  reviewController.getUserReviews
);

module.exports = router;
