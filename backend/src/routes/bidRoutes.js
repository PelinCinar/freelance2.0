const express = require('express');
const router = express.Router();
const bidController = require('../controllers/bidController.js');
const authMiddleware = require("../middlewares/authMiddleware");
const { checkRole } = require("../middlewares/roleAuthMiddleware.js");
const ROLES = require("../constants/roles.js");

router.post('/:projectId', authMiddleware.verifyAccessToken, checkRole(ROLES.FREELANCER), bidController.createBid);

// Projeye gelen teklifleri görüntüleme (işveren için)
router.get('/project/:projectId', authMiddleware.verifyAccessToken, checkRole(ROLES.EMPLOYER), bidController.getBidsByProject);

router.put('/:id', authMiddleware.verifyAccessToken, checkRole(ROLES.FREELANCER), bidController.updateBid);
router.delete('/:id', authMiddleware.verifyAccessToken, checkRole(ROLES.FREELANCER), bidController.deleteBid);
//Teklif kabul ve red işelmleri
router.put('/:bidId/accept', authMiddleware.verifyAccessToken, checkRole(ROLES.EMPLOYER), bidController.acceptBid);
router.put('/:bidId/reject', authMiddleware.verifyAccessToken, checkRole(ROLES.EMPLOYER), bidController.rejectBid);

module.exports = router;
