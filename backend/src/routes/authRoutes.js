const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController.js");
const {
  verifyAccessToken,
  verifyRefreshToken,
} = require("../middlewares/authMiddleware.js");
const {
  validateRegistration,
  validateLogin,
} = require("../validators/authValidator.js");
const validate = require("../middlewares/validatorMiddleware.js");

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Yeni kullanıcı kaydı
 *     description: Yeni bir kullanıcı kaydı oluşturur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [admin, employer, freelancer]
 *                 default: freelancer
 *     responses:
 *       201:
 *         description: Kullanıcı başarıyla oluşturuldu
 *       400:
 *         description: Geçersiz istek
 */
router.post(
  "/register",
  validateRegistration,
  validate,
  authController.register
);
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Kullanıcı giriş işlemi
 *     description: Kullanıcı e-posta ve şifre ile giriş yapabilir
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 description: Kullanıcının e-posta adresi
 *               password:
 *                 type: string
 *                 description: Kullanıcının şifresi
 *     responses:
 *       200:
 *         description: Giriş başarılı, kullanıcıya access token döndürülür
 *       400:
 *         description: Geçersiz giriş bilgileri
 *       401:
 *         description: Geçersiz e-posta veya şifre
 */
router.post("/login", validateLogin, validate, authController.login);
//Access Token süresi dolarsa yeni bir tane alması için kullan
router.post("/refresh-token", verifyRefreshToken, authController.refreshTokens);
router.post("/logout", verifyAccessToken, authController.logout);

module.exports = router;
