const Notification = require("../models/Notification");


const createNotification = async (req, res) => {
  try {
    const { message, userId, senderId, roomId } = req.body; // Gerekli parametreleri alıyoruz
    const receiverId = userId; // Alıcıyı userId'den alıyoruz
    // console.log(req.body)
    // Bildirimi oluştur
    const notification = new Notification({
      user: receiverId, // Bildirimi alacak kullanıcı
      sender: senderId, // Mesajı gönderen kullanıcı
      roomId: roomId, // Odanın ID'si
      message: message, // Mesaj
      type: "message", // Bildirim türü (burada varsayılan olarak 'message' kullanılıyor)
    });

    await notification.save();
    res.status(201).json(notification);
  } catch (err) {
    console.error("Bildirim oluşturulamadı:", err);
    res.status(500).json({ error: "Bildirim oluşturulamadı" });
  }
};

// Kullanıcının tüm bildirimlerini getirelim
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({
      createdAt: -1,
    });//sıralama kısmına göre en yeni üstte gelsin cnm

    res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.error("Bildirimler alınamadı:", error);
    res.status(500).json({ success: false, message: "Bildirimler alınamadı." });
  }
};

// Bildirimi okundu olarak işaretleme.
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;//idyi istekten gelen parametreden alalım devamında zaten bilyorsun aman. mongodbde işlem asenkron gerçkelştiğinden awaiti kullandık zaten falan filan

    await Notification.findByIdAndUpdate(id, { isRead: true });

    res
      .status(200)
      .json({ success: true, message: "Bildirim okundu olarak işaretlendi." });
  } catch (error) {
    console.error("Bildirim güncellenemedi:", error);
    res
      .status(500)
      .json({ success: false, message: "Bildirim güncellenemedi." });
  }
};

// Bildirimi sil
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    await Notification.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: "Bildirim silindi." });
  } catch (error) {
    console.error("Bildirim silinemedi:", error);
    res.status(500).json({ success: false, message: "Bildirim silinemedi." });
  }
};

module.exports = {
  createNotification,
  getNotifications,
  markAsRead,
  deleteNotification,
};
