const jwt = require("jsonwebtoken");
const { accessToken, refreshToken } = require("../config/jwtConfig.js");
const RefreshToken = require("../models/RefreshToken.js");

// Access token doğrulama middleware'i
const verifyAccessToken = (req, res, next) => {
  // Cookie üzerinden access token alıyoruz
  const token = req.cookies.accessToken;

  // Eğer token yoksa 403 hatası döndürüyoruz
  if (!token) {
    return res.status(403).json({ message: "Access token zorunludur." });
  }

  try {
    // Token geçerliliğini kontrol et ve decoded veriyi req.user içine koy
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded; // Kullanıcıyı req.user ile bir sonraki middleware'e taşıyoruz
    next(); // Bir sonraki middleware'e geç
  } catch (error) {
    return res.status(401).json({ message: "Geçersiz veya süresi dolmuş access token." });
  }
};

// Refresh token doğrulama middleware'i
const verifyRefreshToken = async (req, res, next) => {
  // Refresh token ya cookie'den ya da body'den alınabilir
  const token = req.cookies.refreshToken || req.body.refreshToken;

  // Eğer refresh token yoksa 403 hatası döndürüyoruz
  if (!token) {
    return res.status(403).json({ message: "Refresh token zorunludur." });
  }

  try {
    // Refresh token'ı veritabanında arıyoruz
    const storedToken = await RefreshToken.findOne({ token });

    // Eğer token veritabanında yoksa 403 hatası döndür
    if (!storedToken) {
      return res.status(403).json({ message: "Geçersiz refresh token" });
    }

    // Refresh token'ı doğrula
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

    // Token geçerliyse, kullanıcı bilgilerini req.user içine ekle
    req.user = decoded;
    next(); // Bir sonraki middleware'e geç
  } catch (error) {
    // Eğer refresh token'ın süresi dolmuşsa, eski token'ı sil
    if (error.name === "TokenExpiredError") {
      await RefreshToken.deleteOne({ token });
      return res.status(403).json({ message: "Süresi dolmuş refresh token" });
    }

    // Diğer hatalar için geçersiz token mesajı
    return res.status(403).json({ message: "Geçersiz refresh token" });
  }
};

module.exports = { verifyAccessToken, verifyRefreshToken };