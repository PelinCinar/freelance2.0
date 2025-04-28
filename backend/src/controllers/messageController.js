const Message = require('../models/Message');
const User = require('../models/User');

// Yeni mesaj oluştur
const createMessage = async (req, res) => {
  try {
    const { projectId, content } = req.body;

    // Giriş yapmış kullanıcı varsa user bilgisi al
    const sender = req.user?.id || null;
    const user = sender ? await User.findById(sender) : null;

    const message = await Message.create({
      roomId: projectId,  // Oda ID'si olarak proje ID'si kullanılıyor
      sender: sender,
      senderUsername: user?.name || "Misafir",
      content,
    });

    res.status(201).json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error("Mesaj oluşturulamadı:", error);
    res.status(500).json({ success: false, message: "Mesaj oluşturulamadı." });
  }
};

// Bir projeye (odaya) ait tüm mesajları getir
const getMessagesByRoom = async (req, res) => {
  try {
    const { projectId } = req.params;

    const messages = await Message.find({ roomId: projectId }).sort({ timestamp: 1 });

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error("Mesajlar alınamadı:", error);
    res.status(500).json({ success: false, message: "Mesajlar alınamadı." });
  }
};

// Mesaj silme
const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;

    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({ success: false, message: "Mesaj bulunamadı." });
    }

    await Message.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: "Mesaj silindi." });
  } catch (error) {
    console.error("Silme hatası:", error);
    res.status(500).json({ success: false, message: "Silme sırasında hata oluştu." });
  }
};

module.exports = {
  createMessage,
  getMessagesByRoom,
  deleteMessage,
};
