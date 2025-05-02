const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectController.js");
const { checkRole } = require("../middlewares/roleAuthMiddleware.js");
const {
  validateProjectCreation,
} = require("../validators/projectValidator.js");
const ROLES = require("../constants/roles.js");
const authMiddleware = require("../middlewares/authMiddleware");

// Proje oluşturma (işverenler için)
router.post(
  "/",
  authMiddleware.verifyAccessToken,
  checkRole(ROLES.EMPLOYER),
  projectController.createProject
);

// Projeleri listeleme
router.get(
  "/",
  authMiddleware.verifyAccessToken,
  projectController.getProjects
);
router.put(
  "/:id",
  authMiddleware.verifyAccessToken,
  checkRole(ROLES.EMPLOYER),
  projectController.updateProject
);
router.delete(
  "/:id",
  authMiddleware.verifyAccessToken,
  checkRole(ROLES.EMPLOYER),
  projectController.deleteProject
);
router.put(
  "/:id/complete",
  authMiddleware.verifyAccessToken,
  checkRole(ROLES.EMPLOYER),
  projectController.completeProject
);
router.put(
  "/:id/approve",
  authMiddleware.verifyAccessToken,
  checkRole(ROLES.EMPLOYER),
  projectController.approveProject
);
router.get(
  "/my-projects",
  authMiddleware.verifyAccessToken,
  checkRole(ROLES.EMPLOYER),
  projectController.getMyProjects
);

router.get(
  "/:id",
  authMiddleware.verifyAccessToken,
  projectController.getProjectById
);

module.exports = router;
