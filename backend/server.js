require("dotenv").config(); // .env dosyasını yükle
const app = require("./app.js");
const connectDB = require("./src/config/dbConfig"); // Veritabanı bağlantısı

const PORT = process.env.PORT || 5000; // Portu ayarla

// MongoDB'ye bağlan
connectDB();

// Sunucuyu başlat
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor`);
});
