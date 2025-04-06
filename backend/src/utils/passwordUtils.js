const bcrypt = require("bcryptjs");

// Şifreyi hashlemek için fonksiyon
const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(10); // Salt oluşturuyoruz
    const hashedPassword = await bcrypt.hash(password, salt); // Şifreyi hashliyoruz
    return hashedPassword; // Hash'lenmiş şifreyi döndürüyoruz
  } catch (error) {
    throw new Error("Şifre hashleme hatası: " + error.message);
  }
};

// Girilen şifreyi, veritabanındaki hashlenmiş şifreyle karşılaştırmak için fonksiyon
const comparePassword = async (enteredPassword, storedHashedPassword) => {
  try {
    const match = await bcrypt.compare(enteredPassword, storedHashedPassword); // Şifreyi karşılaştırıyoruz
    return match; // true ya da false döner
  } catch (error) {
    throw new Error("Şifre karşılaştırma hatası: " + error.message);
  }
};

module.exports = { hashPassword, comparePassword };
