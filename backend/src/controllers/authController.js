const User = require("../models/User.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const RefreshToken = require("../models/RefreshToken.js");
const { accessToken, refreshToken } = require("../config/jwtConfig.js");
const { hashPassword } = require("../utils/passwordUtils"); // Utils dosyanı dahil et

//!Token oluştruma fonk.
const generateTokens = (user) => {
  const accessTokenPayload = {
    id: user._id,
    name: user.name, 
    email: user.email,
    // password:user.password,
    role: user.role,
    createdAt: user.createdAt,
  };
  const refreshTokenPayload = { id: user._id };
  //!Access token oluşturalım.
  const newAccessToken = jwt.sign(
    accessTokenPayload,
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: accessToken.expiresIn,
    }
  );
  // console.log("User Data in generateTokens:", user);

  //!Refresh token oluşturulaım
  const newRefreshToken = jwt.sign(
    refreshTokenPayload,
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: refreshToken.expiresIn,
    }
  );

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

//kullanıcı kaydı
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Kullanıcı var mı?
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Bu email zaten kayıtlı." });
    }

    // Şifreyi hashleyelim
    // console.log("hashlenmiş password", hashedPassword);

    // Yeni kullanıcı oluşturalım ve hashlediğimiz şifreyi veritabanına kaydedelim
    const newUser = new User({
      name,
      email,
      password:password,
      role,
    });
    await newUser.save();

    res
      .status(201)
      .json({ message: "Kullanıcı başarıyla oluşturuldu!", user: newUser });
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası", error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kullanıcıyı bulalım
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Bu kullanıcı bulunamadı" });
    }

    // Şifreyi doğrulayalım
    const validPassword = await user.comparePassword(password);
    if (!validPassword) {
      return res.status(401).json({ message: "Geçersiz email veya şifre." });
    }
    // Kullanıcı bilgilerini döndürelim
    const userResponse = user.toObject();
    delete userResponse.password; // Şifreyi dışarıda bırak

    //!Yeni token oluşturma
    const tokens = generateTokens(user);
    //!Yeni refresh tokenı vtbanına kaydetme
    await RefreshToken.create({
      userId: user._id,
      token: tokens.refreshToken,
    });
    //! Cookie'leri ayarla

    res.cookie("accessToken", tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, //15dk
    });
    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api/auth/refresh-token",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 gün
    });

    // Başarılı giriş için kullanıcı bilgilerini döndürelim
    res.status(200).json({
      message: "Giriş Başarılı",
      user: userResponse,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


//!Token yenileme işlemi
const refreshTokens = async (req, res) => {
  try {
    const oldRefreshToken = req.body.refreshToken;
    console.log(req.user);
   
    // Eski refresh token'ı veritabanından sil
    await RefreshToken.deleteOne({ token: oldRefreshToken });

    // Yeni token'ları oluştur
    const tokens = generateTokens(req.user);

    // Yeni refresh token'ı veritabanına kaydet
    await RefreshToken.create({
      userId: req.user.id,
      token: tokens.refreshToken,
    });

    // Cookie'leri ayarla
    res.cookie("accessToken", tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 dakika
    });

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api/auth/refresh-token",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 gün
    });

    res.json({ message: "Tokens refreshed" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const logout = async (req, res) => {
  try {
    const refreshTokens = req.cookies.refreshToken;
    if (refreshTokens) {
      await RefreshToken.deleteOne({ token: refreshTokens });
    }

    // Cookie'leri temizle
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken", { path: "/api/auth/refresh-token" });

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


module.exports = { register, login,refreshTokens,logout };