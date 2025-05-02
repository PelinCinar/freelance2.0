const express = require('express');
const router = express.Router();
const bidController = require('../controllers/bidController.js');
const authMiddleware = require("../middlewares/authMiddleware");
const { checkRole } = require("../middlewares/roleAuthMiddleware.js");
const ROLES = require("../constants/roles.js");

router.post('/', authMiddleware.verifyAccessToken, checkRole(ROLES.FREELANCER), bidController.createBid);

// Projeye gelen teklifleri görüntüleme (işveren için)
router.get('/project/:projectId', authMiddleware.verifyAccessToken, checkRole(ROLES.EMPLOYER), bidController.getBidsByProject);

router.put('/:id', authMiddleware.verifyAccessToken, checkRole(ROLES.FREELANCER), bidController.updateBid);
router.delete('/:id', authMiddleware.verifyAccessToken, checkRole(ROLES.FREELANCER), bidController.deleteBid);
//Teklif kabul ve red işelmleri
router.put('/:bidId/accept', authMiddleware.verifyAccessToken, checkRole(ROLES.EMPLOYER), bidController.acceptBid);
router.put('/:bidId/reject', authMiddleware.verifyAccessToken, checkRole(ROLES.EMPLOYER), bidController.rejectBid);

// Kullanıcının verdiği tüm teklifleri getirme (freelancer için)
router.get('/my-bids', authMiddleware.verifyAccessToken, checkRole(ROLES.FREELANCER), bidController.getMyBids);

router.get('/open-projects-with-bids', authMiddleware.verifyAccessToken, checkRole(ROLES.FREELANCER), bidController.getMyBids);


module.exports = router;
