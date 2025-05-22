const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const authMiddleware = require("../middlewares/authMiddleware");
const { checkRole } = require("../middlewares/roleAuthMiddleware");
const ROLES = require("../constants/roles");

router.get(
  "/dashboard",
  authMiddleware.verifyAccessToken,
  checkRole(ROLES.ADMIN),
  adminController.getGeneralStats
);

module.exports = router;
