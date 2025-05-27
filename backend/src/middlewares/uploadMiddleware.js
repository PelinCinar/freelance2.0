const multer = require("multer");//dosya yüklemek için popüler middlewareğ
const path = require("path");
const fs = require("fs");

// uploads ve images klasörlerini oluştur
const uploadsDir = "uploads/";
const imagesDir = "images/";

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Genel dosyalar için storage (portfolyo, proje dosyaları)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // klasörüne kaydediyoruz
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  }
});

// Profil fotoğrafları için storage
const profileImageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "images/"); // profil fotoğrafları images klasörüne
  },
  filename: function (req, file, cb) {
    const uniqueName = "profile-" + Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  }
});

//dosya uzantısını kontrol ediyoruzs
const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|docx|doc|png|jpg|jpeg/;//kabul ettiğimiz uzantılar.
  const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());//dosya uzantısını küçük harfe çevirip aldırıyoruz.
  if (ext) cb(null, true);//dosya tipi uygunsa bu cb cart curtuyla kabul ediyoruz.
  else cb(new Error("Yalnızca PDF, DOC, PNG, JPG dosyaları yüklenebilir!"));
};

// Profil fotoğrafları için dosya filtresi (sadece resim dosyaları)
const imageFilter = (req, file, cb) => {
  const allowedTypes = /png|jpg|jpeg/;//sadece resim dosyaları
  const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  if (ext) cb(null, true);
  else cb(new Error("Yalnızca PNG, JPG, JPEG dosyaları yüklenebilir!"));
};

const upload = multer({ storage, fileFilter });//bu fonk. dosya yükleme işlemini yapacak bir özel middleware döndürüyor. instances
const uploadProfileImage = multer({ storage: profileImageStorage, fileFilter: imageFilter });

module.exports = { upload, uploadProfileImage };
