const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware.verifyAccessToken);

// Bildirim oluşturma (genelde sistem içinden çağrılır ama test için tutulabilir)
router.post('/', notificationController.createNotification);

// Kullanıcının bildirimlerini al
router.get('/', notificationController.getNotifications);

// Okundu olarak işaretleme
router.put('/:id/read', notificationController.markAsRead);

// Bildirim silme
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;
