const multer = require("multer");
const path = require("path");

// Dosyaların kaydedileceği klasör
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // klasör adı
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|docx|doc|png|jpg|jpeg/;
  const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  if (ext) cb(null, true);
  else cb(new Error("Yalnızca PDF, DOC, PNG, JPG dosyaları yüklenebilir!"));
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
