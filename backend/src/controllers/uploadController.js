const User = require("../models/User");

const uploadPortfolio = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Dosya bulunamadı." });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "Kullanıcı bulunamadı." });
    }

    // Yeni dosyayı portfolio dizisine ekleyelim
    user.portfolio.push({
      fileName: req.file.filename,
      fileUrl: `/uploads/${req.file.filename}`, // Dosyanın yolu
      uploadedAt: new Date(),
    });

    await user.save();

    res.status(200).json({ success: true, message: "Portfolyo başarıyla yüklendi." });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ success: false, message: "Portfolyo yüklenirken bir hata oluştu." });
  }
};


module.exports = { uploadPortfolio };
