const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const userController = require("../controllers/userController");

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Kullanıcı Profilini Görüntüle
 *     description: Kullanıcı profil bilgilerini döndürür. Kullanıcı kimliği doğrulama ile alınmalıdır.
 *     tags:
 *       - Kullanıcı
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Kullanıcı profili başarıyla getirildi.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: Kullanıcının ID'si
 *                 name:
 *                   type: string
 *                   description: Kullanıcının adı
 *                 email:
 *                   type: string
 *                   description: Kullanıcının e-posta adresi
 *                 role:
 *                   type: string
 *                   description: Kullanıcının rolü
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   description: Kullanıcının oluşturulma tarihi
 *       401:
 *         description: Kullanıcı kimliği doğrulama hatası (Token geçersiz veya eksik).
 *       403:
 *         description: Erişim izni yok (Geçerli bir token sağlanmalıdır).
 *       404:
 *         description: Kullanıcı bulunamadı.
 *       500:
 *         description: Sunucu hatası.
 */

router.get("/", authMiddleware.verifyAccessToken, userController.getProfile);

/**
 * @swagger
 /api/users/update-profile:
  put:
    summary: Kullanıcı Profilini Güncelle
    description: Kullanıcı profil bilgilerini günceller. Kullanıcı kimliği doğrulama ile yapılmalıdır.
    tags:
      - Kullanıcı
    security:
      - bearerAuth: []
    requestBody:
      content:
        application/json:
          schema:
            type: object
            properties:
              name:
                type: string
              email:
                type: string
              password:
                type: string
    responses:
      200:
        description: Profil başarıyla güncellendi.
      400:
        description: Geçersiz parametreler veya boş alanlar.
      401:
        description: Kimlik doğrulama hatası (Token geçersiz veya eksik).
      404:
        description: Kullanıcı bulunamadı.
      500:
        description: Sunucu hatası.
 */

router.put("/update-profile", authMiddleware.verifyAccessToken, userController.updateProfile);

module.exports = router;
