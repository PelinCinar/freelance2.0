const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const authMiddleware = require('../middlewares/authMiddleware');
const { checkRole } = require('../middlewares/roleAuthMiddleware');
const ROLES = require('../constants/roles');

// Mesaj oluşturma (herhangi bir kullanıcı - chat ile ilişkili)
router.post(
  '/',
  authMiddleware.verifyAccessToken,
  messageController.createMessage
);

// Projeye (room) ait mesajları getirme
router.get(
  '/:roomId',
  authMiddleware.verifyAccessToken,
  checkRole(ROLES.EMPLOYER, ROLES.ADMIN), // Hem employer hem admin görebilir
  messageController.getMessagesByRoom
);

// (İsteğe bağlı) mesaj silme - sadece admin yapabilir
router.delete(
  '/:id',
  authMiddleware.verifyAccessToken,
  checkRole(ROLES.ADMIN),
  messageController.deleteMessage
);

module.exports = router;
