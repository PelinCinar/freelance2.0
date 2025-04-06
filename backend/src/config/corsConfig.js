const cors = require('cors');

const corsOptions = {
  origin: function (origin, callback) {
    const whiteList = [
      "http://localhost:8080",
      "http://localhost:5173",
      "http://127.0.0.1:5173",
    ];
    
    if (whiteList.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("CORS politikası tarafından engellendiniz."));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  maxAge: 86400, // 24 saat
};

// Express'e CORS'u ekle
module.exports = corsOptions; 