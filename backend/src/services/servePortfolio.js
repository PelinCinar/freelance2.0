const path = require("path");
const express = require("express");
const app = express();

// Portföy dosyasını göstermek için API
app.get("/uploads/:fileName", (req, res) => {
  const { fileName } = req.params;
  const filePath = path.join(__dirname, "uploads", fileName);
  res.sendFile(filePath);  // Dosyayı kullanıcıya gönder
});
