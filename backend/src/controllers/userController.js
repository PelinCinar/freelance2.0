const User = require("../models/User.js");
const bcrypt = require("bcryptjs");

const getProfile = async (req, res) => {
  try {
    const userId = req.user._id; // Token'dan alınan kullanıcı ID'si
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "Kullanıcı bulunamadı" });
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const updateProfile = async (req, res) => {
  try {
    const { email, name, password } = req.body;
    const userId = req.user._id;  // Token'dan alınan kullanıcı ID'si (düzeltildi)

    console.log("Profil güncelleme isteği:", { userId, email, name, hasPassword: !!password });

    // Kullanıcıyı bul
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "Kullanıcı bulunamadı" });
    }

    // E-posta benzersizlik kontrolü (eğer e-posta değiştiriliyorsa)
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ success: false, message: "Bu e-posta adresi zaten kullanılıyor" });
      }
    }

    // Şifre güncelleme (eğer yeni şifre verilmişse)
    if (password && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      user.password = hashedPassword;
    }

    // Diğer alanları güncelle
    if (email) user.email = email;
    if (name) user.name = name;

    // Kullanıcıyı kaydet
    await user.save();

    // Şifreyi response'dan çıkar
    const userResponse = user.toObject();
    delete userResponse.password;

    console.log("Profil başarıyla güncellendi:", userResponse.name, userResponse.email);

    res.json({ success: true, user: userResponse });
  } catch (error) {
    console.error("Profil güncelleme hatası:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};
// Kullanıcıyı kimliği doğrulanmış olarak al ("/me" endpointi)
// const getCurrentUser = async (req, res) => {
//   try {
//     const userId = req.user._id; // Token'dan alınan kullanıcı ID'si
//     const user = await User.findById(userId).select("-password"); // Şifreyi gizli tutalım

//     if (!user) {
//       return res.status(404).json({ success: false, message: "Kullanıcı bulunamadı" });
//     }

//     res.json({ success: true, user });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// export işlemi
module.exports = { getProfile, updateProfile  };
