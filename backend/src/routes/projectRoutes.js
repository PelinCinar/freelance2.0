const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController.js');
const { checkRole } = require("../middlewares/roleAuthMiddleware.js");
const { validateProjectCreation } = require("../validators/projectValidator.js");
const ROLES = require("../constants/roles.js")
const authMiddleware = require("../middlewares/authMiddleware");


// Proje oluşturma (işverenler için)
router.post('/',authMiddleware.verifyAccessToken,checkRole(ROLES.EMPLOYER), projectController.createProject);

// Projeleri listeleme
router.get('/',authMiddleware.verifyAccessToken, projectController.getProjects);
router.put('/:id',  authMiddleware.verifyAccessToken,checkRole(ROLES.EMPLOYER), projectController.updateProject);
router.delete('/:id', authMiddleware.verifyAccessToken, checkRole(ROLES.EMPLOYER), projectController.deleteProject);

module.exports = router;