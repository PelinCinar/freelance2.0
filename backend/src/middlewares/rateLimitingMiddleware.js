const rateLimit = require("express-rate-limit");

// Rate limiting yapılandırması
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 100, // Her IP adresine 15 dakika içinde 100 istek sınırı
  message: "Çok fazla istek yaptınız, lütfen daha sonra deneyin.",
  standardHeaders: true, // `RateLimit-*` başlıklarını kullanmak için
  legacyHeaders: false, // `X-RateLimit-*` başlıklarını kaldır
});

module.exports = limiter;
