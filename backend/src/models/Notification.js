const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Bildirimi alacak kişi
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Mesajı gönderen kişi
  roomId: { type: String, required: true },  // Bildirimi ilişkilendirdiğimiz odanın id'si
  type: { type: String, enum: ['message', 'offer', 'review'], default: 'message' },
  message: { type: String, required: true }, // Bildirim mesajı
  link: { type: String }, // Bildirime tıklandığında gidilecek sayfa (örneğin: proje, mesaj, teklif)
  isRead: { type: Boolean, default: false }, // Okundu durumu
  createdAt: { type: Date, default: Date.now }, // Oluşturulma tarihi
});

module.exports = mongoose.model("Notification", notificationSchema);
