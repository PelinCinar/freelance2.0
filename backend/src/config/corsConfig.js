const cors = require('cors');

const corsOptions = {
  origin: function (origin, callback) {
    const whiteList = [
      // "http://127.0.0.1:8080",
      "http://localhost:8080",
      "http://localhost:5174",
      "http://127.0.0.1:5174",
      "http://localhost:5173",
      "http://127.0.0.1:5173",
    ];

    if (!origin || whiteList.includes(origin)) {
      // origin undefined/null veya whitelist'te varsa izin ver
      callback(null, true);
    } else {
      callback(new Error("CORS politikası tarafından engellendiniz."));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept", "Origin", "X-Requested-With"],
  exposedHeaders: ["Content-Length", "Content-Type"],
  credentials: true,
  maxAge: 86400, // 24 saat
};

// Express'e CORS'u ekle
module.exports = corsOptions;