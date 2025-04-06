const User = require("../models/User.js");
const bcrypt = require("bcryptjs");

const getProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Token'dan alınan kullanıcı ID'si
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
    const { email,name,password} = req.body;
    const userId = req.user.id;  // Token'dan alınan kullanıcı ID'si

    // console.log("Gelen id:", userId);

    // Kullanıcıyı bul ve güncelle
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "Kullanıcı bulunamadı" });
    }
    if (password) {
      const salt = await bcrypt.genSalt(10);  // Salt oluştur
      const hashedPassword = await bcrypt.hash(password, salt);  // Şifreyi hashle
      user.password = hashedPassword;  // Hashlenmiş şifreyi kaydet
    }
    // Profildeki email'i güncelle
    user.email = email || user.email;
    if(name) user.name = name;
    await user.save();

    res.json({ success: true, user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// export işlemi
module.exports = { getProfile, updateProfile };
